import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';
import { InsertCoach, InsertCoachImage, InsertCoachFeature } from '@shared/schema';
import { log } from './vite';
import { sql } from 'drizzle-orm';

// Base URL for scraping
const BASE_URL = 'https://www.prevost-stuff.com';

// Interface for rich metadata from the index page
interface IndexHit {
  url: string;
  meta: {
    title: string;
    seller: string | null;
    converter: string | null;
    model: string | null;
    slides: number | null;
    state: string | null;
    price: number | null;
  };
}

/**
 * Main scraper controller that orchestrates the scraping process
 */
export async function runScraper() {
  try {
    log('Starting scraper run', 'scraper');
    const coachListings = await scrapeCoachListings();
    log(`Found ${coachListings.length} coach listings`, 'scraper');
    
    // Process each listing
    for (const hit of coachListings) {
      try {
        await processCoachListing(hit);
      } catch (err) {
        log(`Error processing listing ${hit.url}: ${err}`, 'scraper');
      }
    }
    
    log('Completed scraper run', 'scraper');
  } catch (error) {
    log(`Scraper failed: ${error}`, 'scraper');
  }
}

/**
 * Scrapes the coach listings page to get all coach data
 */
async function scrapeCoachListings(): Promise<IndexHit[]> {
  const hits: IndexHit[] = [];
  
  try {
    // Use the new main listing page URL
    const { data } = await axios.get(`${BASE_URL}/forsale/public_list_ads.php`);
    const $ = cheerio.load(data);
    
    // Find coach listing links in the HTML table
    $('a[href$=".html"]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      const fullUrl = href.startsWith('http') ? href : 
                      href.startsWith('/') ? `${BASE_URL}${href}` : 
                      `${BASE_URL}/forsale/${href}`;
      
      // grab the row text (anchor + following siblings)
      const rawText = $(element).parent().text().replace(/\s+/g, ' ').trim();
      
      // skip trailers / stackers
      if (/hauler|stacker|trailer/i.test(rawText)) return;
      
      // ---- Extract metadata from the listing row ----
      
      // Get title without "Prevost"
      const cleanTitle = $(element).text()
        .replace(/\bPrevost\b/gi, '').trim();
      
      // Extract seller
      const seller = rawText.match(/Seller:\s*([^A-Z].*?)\s{2,}/i)?.[1]?.trim() ?? null;
      
      // Extract converter (Liberty, etc.)
      const converter = rawText.match(/Converter:\s*([^A-Z].*?)\s{2,}/i)?.[1]?.trim() ?? null;
      
      // Extract model (H345)
      const model = rawText.match(/Model:\s*([A-Z0-9\-]+)/i)?.[1] ?? null;
      
      // Extract number of slides
      const slidesStr = rawText.match(/Slides:\s*(\d)/i)?.[1];
      const slides = slidesStr ? Number(slidesStr) : null;
      
      // Extract state (FL)
      const state = rawText.match(/State:\s*([A-Z]{2})/i)?.[1] ?? null;
      
      // Extract price without $ and commas
      const priceStr = rawText.match(/Price:\s*\$([\d,]+)/i)?.[1];
      const price = priceStr ? Number(priceStr.replace(/,/g, '')) : null;
      
      hits.push({
        url: fullUrl,
        meta: { 
          title: cleanTitle, 
          seller, 
          converter, 
          model, 
          slides, 
          state, 
          price 
        }
      });
    });
    
    // Wait to avoid overwhelming the source server
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    log(`Error scraping coach listings: ${error}`, 'scraper');
  }
  
  return hits;
}

/**
 * Process an individual coach listing
 */
async function processCoachListing(hit: IndexHit) {
  const { url, meta } = hit;
  
  try {
    log(`Processing coach listing: ${url}`, 'scraper');
    
    // Extract source ID from URL
    const sourceId = extractSourceId(url);
    
    // Check if coach already exists
    const existingCoach = await storage.getCoachBySourceId(sourceId);
    if (existingCoach) {
      log(`Coach with source ID ${sourceId} already exists, skipping`, 'scraper');
      return;
    }
    
    // Fetch and parse the coach details page for more info and photos
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Use the title without "Prevost" from meta
    const title = meta.title;
    
    // Parse year from title
    let titleParts = parseCoachTitle(title);
    
    // If no year found in title, look for it in the page
    if (!titleParts.year) {
      const pageText = $('body').text();
      const yearMatch = pageText.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        titleParts.year = parseInt(yearMatch[0]);
      } else {
        titleParts.year = new Date().getFullYear();
      }
    }
    
    // Use the converter from meta as the make, otherwise fallback to title parsing
    const make = meta.converter || titleParts.make || 'Unknown';
    
    // Use the model from meta, otherwise fallback to title parsing
    const model = meta.model || titleParts.model || 'Unknown';
    
    // Use the price from meta, or fallback to extracting from the page
    let price = meta.price || 0;
    if (price === 0) {
      const priceRegex = /\$[\d,]+|[\d,]+\s*dollars|price\s*:?\s*[\d,]+/i;
      const priceMatch = $('body').text().match(priceRegex);
      if (priceMatch) {
        price = parsePrice(priceMatch[0]);
      }
      
      // If still no price found, set a default price
      if (price === 0) {
        price = 500000; // Default price for luxury coaches
      }
    }
    
    // Extract description - look for long paragraphs
    let description = '';
    $('p, div').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 100 && !text.includes('Copyright')) {
        description = text;
        return false; // Break the loop once we find a long paragraph
      }
    });
    
    // Extract images - any img tag on the page, limit to 20 max
    const imageUrls: string[] = [];
    $('img').each((_, element) => {
      const imgSrc = $(element).attr('src') || $(element).attr('data-src');
      if (imgSrc) {
        const fullUrl = imgSrc.startsWith('http') ? imgSrc : 
                      imgSrc.startsWith('/') ? `${BASE_URL}${imgSrc}` : 
                      `${BASE_URL}/forsale/${imgSrc}`;
        
        // Only include actual image files
        if (fullUrl.match(/\.(jpg|jpeg|png|gif)$/i) && !imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
        }
      }
    });
    
    // Get unique images and limit to first 20
    const uniqueImages = Array.from(new Set(imageUrls)).slice(0, 20);
    
    // Extract featured image - first image or a larger one
    let featuredImage = '';
    if (uniqueImages.length > 0) {
      featuredImage = uniqueImages[0];
      
      // Look for an image with larger dimensions or "main" in filename
      for (const imgUrl of uniqueImages) {
        if (imgUrl.includes('main') || imgUrl.includes('large') || imgUrl.includes('hero')) {
          featuredImage = imgUrl;
          break;
        }
      }
    }
    
    // Extract features - any list items or short text blocks
    const features: string[] = [];
    $('li, td, div').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 10 && text.length < 100 && 
          !text.includes('Copyright') && 
          !text.includes('http') && 
          !features.includes(text)) {
        features.push(text);
      }
    });
    
    // Get the rest of the specifications from the page
    let mileage = 0;
    let length = '';
    let bedType = '';
    let exteriorColor = '';
    let interiorColor = '';
    
    // Use slide count from meta or extract from page
    let slideCount = meta.slides || 0;
    
    // Extract seller and location information from page content
    let seller = meta.seller || null;
    let location = meta.state || null;
    
    // If no slide count in meta, try to extract from page
    const pageText = $('body').text().toLowerCase();
    
    if (slideCount === 0) {
      const slideMatch = pageText.match(/(single|double|triple|quad|(\d+))\s*(slide|slideout)/i);
      if (slideMatch) {
        if (slideMatch[1] === 'single') slideCount = 1;
        else if (slideMatch[1] === 'double') slideCount = 2;
        else if (slideMatch[1] === 'triple') slideCount = 3;
        else if (slideMatch[1] === 'quad') slideCount = 4;
        else if (slideMatch[2]) slideCount = parseInt(slideMatch[2]);
      }
    }
    
    // Look for seller information if not in meta
    if (!seller) {
      // Check for common seller patterns
      const sellerPatterns = [
        /contact\s*:?\s*([A-Za-z\s]+?)\s*\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/i,
        /(?:offered by|offered for sale by|presented by|marketed by|from|by|call)\s*:?\s*([A-Za-z\s]+?(?:Coach|RV|Sales|Motors))\s/i,
        /for\s*(?:more)?\s*information\s*(?:contact|call)?\s*:?\s*([A-Za-z\s]+?(?:Coach|RV|Sales|Motors))/i
      ];
      
      for (const pattern of sellerPatterns) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
          seller = match[1].trim();
          break;
        }
      }
    }
    
    // Look for location information if not in meta
    if (!location) {
      // Check for state names or abbreviations
      const states = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
      };
      
      // Search for either full state names or abbreviations
      const statePattern = new RegExp('\\b(' + 
        Object.entries(states).map(([abbr, name]) => `${abbr}|${name}`).join('|') + 
        ')\\b', 'i');
      
      const stateMatch = pageText.match(statePattern);
      if (stateMatch && stateMatch[1]) {
        location = stateMatch[1].trim();
      }
    }
    
    // Look for mileage
    const mileageMatch = pageText.match(/(\d{1,3}(,\d{3})*)\s*miles/i);
    if (mileageMatch) {
      mileage = parseInt(mileageMatch[1].replace(/,/g, ''));
    }
    
    // Look for length
    const lengthMatch = pageText.match(/(\d{2})\s*('|ft|feet)/i);
    if (lengthMatch) {
      length = `${lengthMatch[1]} feet`;
    }
    
    // Look for bed type
    const bedMatch = pageText.match(/(king|queen|twin|bunk)\s*(size)?\s*bed/i);
    if (bedMatch) {
      bedType = bedMatch[0];
    }
    
    // Look for colors
    const exteriorColorMatch = pageText.match(/exterior\s*(is|color|finish|paint)?:?\s*([a-z\s]+)/i);
    if (exteriorColorMatch && exteriorColorMatch[2]) {
      exteriorColor = exteriorColorMatch[2].trim();
    }
    
    const interiorColorMatch = pageText.match(/interior\s*(is|color|finish)?:?\s*([a-z\s]+)/i);
    if (interiorColorMatch && interiorColorMatch[2]) {
      interiorColor = interiorColorMatch[2].trim();
    }
    
    // Assign a coach type based on the data
    let typeId: number | undefined = undefined;
    
    const lowerTitle = title.toLowerCase();
    const lowerMake = make.toLowerCase();
    
    // Class A is the default for large luxury coaches
    if (lowerTitle.includes('luxury') || 
        lowerTitle.includes('class a') ||
        lowerMake === 'prevost' ||
        lowerMake === 'marathon' ||
        lowerMake === 'featherlite' ||
        lowerMake === 'millennium' ||
        lowerMake === 'liberty' ||
        lowerMake === 'emerald') {
      typeId = 4; // Luxury type
    } else if (lowerTitle.includes('class a')) {
      typeId = 1; // Class A
    } else if (lowerTitle.includes('class b')) {
      typeId = 2; // Class B
    } else if (lowerTitle.includes('class c')) {
      typeId = 3; // Class C
    }
    
    // Construct coach data
    const coachData: InsertCoach = {
      title,
      year: titleParts.year || new Date().getFullYear(),
      make, // Converter
      model, // Chassis/Model (H345)
      price,
      description,
      exteriorColor,
      interiorColor,
      mileage,
      length,
      slideCount,
      bedType,
      featuredImage,
      status: 'available',
      isFeatured: false,
      isNewArrival: true,
      seller,
      location,
      sourceId,
      sourceUrl: url,
      typeId, // Add the coach type ID
    };
    
    // Save coach to database
    const coach = await storage.createCoach(coachData);
    
    // Delete existing images for the coach (if overwriting)
    await storage.deleteCoachImages(coach.id);
    
    // Save coach images (up to 20 max)
    for (let i = 0; i < uniqueImages.length && i < 20; i++) {
      const imageData: InsertCoachImage = {
        coachId: coach.id,
        imageUrl: uniqueImages[i],
        isFeatured: i === 0,
        position: i,
      };
      await storage.createCoachImage(imageData);
    }
    
    // Delete existing features for the coach (if overwriting)
    await storage.deleteCoachFeatures(coach.id);
    
    // Save coach features
    for (const feature of features) {
      const featureData: InsertCoachFeature = {
        coachId: coach.id,
        name: feature,
      };
      await storage.createCoachFeature(featureData);
    }
    
    log(`Successfully processed coach: ${title}`, 'scraper');
    
  } catch (error) {
    log(`Error processing coach listing ${url}: ${error}`, 'scraper');
    throw error;
  }
}

/**
 * Extract source ID from URL
 */
function extractSourceId(url: string): string {
  // Try to extract a unique identifier from the URL
  // First look for an ID parameter
  const idMatches = url.match(/[?&]id=([^&]+)/);
  if (idMatches) {
    return idMatches[1];
  }
  
  // Otherwise, use the filename as the ID
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1].split('?')[0];
  
  if (filename) {
    return filename;
  }
  
  // If we still can't extract an ID, generate a timestamp-based one
  return `source_${Date.now()}`;
}

/**
 * Parse coach title to extract year, make, and model
 */
function parseCoachTitle(title: string): { year?: number; make?: string; model?: string } {
  const result: { year?: number; make?: string; model?: string } = {};
  
  // Try to extract year (4 digit number)
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[0]);
  }
  
  // Common makes to look for
  const commonMakes = ['Prevost', 'Marathon', 'Liberty', 'Millennium', 'Featherlite', 'Emerald', 'Newmar', 'Foretravel'];
  for (const make of commonMakes) {
    if (title.includes(make)) {
      result.make = make;
      break;
    }
  }
  
  // Common models to look for
  const commonModels = ['H3-45', 'X3-45', 'XLII', 'Liberty', 'Executive', 'VIP', 'Allegiance', 'Heritage'];
  for (const model of commonModels) {
    if (title.includes(model)) {
      result.model = model;
      break;
    }
  }
  
  return result;
}

/**
 * Parse price text to get numeric value
 */
function parsePrice(priceText: string): number {
  // Remove all non-numeric characters except decimal point
  const numericString = priceText.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
}
