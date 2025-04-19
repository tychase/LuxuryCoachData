import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';
import { InsertCoach, InsertCoachImage, InsertCoachFeature } from '@shared/schema';
import { log } from './vite';

// Base URL for scraping
const BASE_URL = 'https://www.prevost-stuff.com';

/**
 * Main scraper controller that orchestrates the scraping process
 */
export async function runScraper() {
  try {
    log('Starting scraper run', 'scraper');
    const coachListings = await scrapeCoachListings();
    log(`Found ${coachListings.length} coach listings`, 'scraper');
    
    // Process each listing
    for (const listingUrl of coachListings) {
      try {
        await processCoachListing(listingUrl);
      } catch (err) {
        log(`Error processing listing ${listingUrl}: ${err}`, 'scraper');
      }
    }
    
    log('Completed scraper run', 'scraper');
  } catch (error) {
    log(`Scraper failed: ${error}`, 'scraper');
  }
}

/**
 * Scrapes the coach listings pages to get all coach URLs
 */
async function scrapeCoachListings(maxPages = 5): Promise<string[]> {
  const coachUrls: string[] = [];
  const excludedKeywords = [
    'dealer', 'property', 'real_estate', 'forum', 'calendar', 'contact', 
    'about', 'links', 'list', 'index', 'home', 'news', 'login', 'register'
  ];
  
  try {
    // Use the new main listing page URL
    const { data } = await axios.get(`${BASE_URL}/forsale/public_list_ads.php`);
    const $ = cheerio.load(data);
    
    // Find coach listing links - look for links in tables
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim().toLowerCase();
      const hasImage = $(element).find('img').length > 0;
      
      if (!href) return;
      
      // Skip URLs with excluded keywords
      const lowerHref = href.toLowerCase();
      if (excludedKeywords.some(keyword => lowerHref.includes(keyword.toLowerCase()))) {
        return;
      }
      
      // Look for ad detail links which typically have "detail" or "ad_detail" in them
      if ((href.includes('detail') || 
           href.includes('ad.php') || 
           href.includes('view') || 
           href.includes('coach')) && 
          (hasImage || 
           text.includes('coach') || 
           text.includes('prevost') || 
           text.includes('sale') || 
           text.includes('marathon') ||
           text.includes('featherlite') ||
           text.includes('conversion'))) {
        
        const fullUrl = href.startsWith('http') ? href : 
                      href.startsWith('/') ? `${BASE_URL}${href}` : 
                      `${BASE_URL}/forsale/${href}`;
        
        if (!coachUrls.includes(fullUrl) && 
            !fullUrl.includes('public_list_ads.php')) {
          coachUrls.push(fullUrl);
        }
      }
    });
    
    // Wait to avoid overwhelming the source server
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    log(`Error scraping coach listings: ${error}`, 'scraper');
  }
  
  return coachUrls;
}

/**
 * Process an individual coach listing
 */
async function processCoachListing(url: string) {
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
    
    // Fetch and parse the coach details page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Extract title - use filename if no title found
    let title = '';
    $('h1, h2, h3, title, b').each((_, element) => {
      const text = $(element).text().trim();
      if (text && (text.includes('Prevost') || text.includes('Coach') || text.includes('20'))) {
        if (!title || text.length > title.length) {
          title = text;
        }
      }
    });
    
    // If still no title, use filename
    if (!title) {
      const urlParts = url.split('/');
      title = urlParts[urlParts.length - 1].replace('.htm', '').replace('.html', '').replace(/_/g, ' ');
    }
    
    // Parse year, make, model from title or page content
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
    
    // If no make found, default to Prevost
    if (!titleParts.make) {
      titleParts.make = 'Prevost';
    }
    
    // If no model found, try to determine from page content
    if (!titleParts.model) {
      const pageText = $('body').text().toLowerCase();
      if (pageText.includes('h3-45')) {
        titleParts.model = 'H3-45';
      } else if (pageText.includes('x3-45')) {
        titleParts.model = 'X3-45';
      } else {
        titleParts.model = 'Luxury Coach';
      }
    }
    
    // Extract price from any text that looks like a price
    let price = 0;
    const priceRegex = /\$[\d,]+|[\d,]+\s*dollars|price\s*:?\s*[\d,]+/i;
    const priceMatch = $('body').text().match(priceRegex);
    if (priceMatch) {
      price = parsePrice(priceMatch[0]);
    }
    
    // If no price found, set a default price
    if (price === 0) {
      price = 500000; // Default price for luxury coaches
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
    
    // Extract images - any img tag on the page
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
    
    // Extract featured image - first image or a larger one
    let featuredImage = '';
    if (imageUrls.length > 0) {
      featuredImage = imageUrls[0];
      
      // Look for an image with larger dimensions or "main" in filename
      for (const imgUrl of imageUrls) {
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
    
    // Extract specifications from any table structures or lists
    let mileage = 0;
    let length = '';
    let slideCount = 0;
    let bedType = '';
    let exteriorColor = '';
    let interiorColor = '';
    
    // Look for common specs in the page text
    const pageText = $('body').text().toLowerCase();
    
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
    
    // Look for slide outs
    const slideMatch = pageText.match(/(single|double|triple|quad|(\d+))\s*(slide|slideout)/i);
    if (slideMatch) {
      if (slideMatch[1] === 'single') slideCount = 1;
      else if (slideMatch[1] === 'double') slideCount = 2;
      else if (slideMatch[1] === 'triple') slideCount = 3;
      else if (slideMatch[1] === 'quad') slideCount = 4;
      else if (slideMatch[2]) slideCount = parseInt(slideMatch[2]);
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
    const make = titleParts.make?.toLowerCase() || '';
    
    // Class A is the default for large luxury coaches
    if (lowerTitle.includes('luxury') || 
        lowerTitle.includes('class a') ||
        make === 'prevost' ||
        make === 'marathon' ||
        make === 'featherlite' ||
        make === 'millennium' ||
        make === 'liberty' ||
        make === 'emerald') {
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
      make: titleParts.make || 'Unknown',
      model: titleParts.model || 'Unknown',
      price: price, // Now should be accepted as a number
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
      sourceId,
      sourceUrl: url,
      typeId, // Add the coach type ID
    };
    
    // Save coach to database
    const coach = await storage.createCoach(coachData);
    
    // Save coach images
    for (let i = 0; i < imageUrls.length; i++) {
      const imageData: InsertCoachImage = {
        coachId: coach.id,
        imageUrl: imageUrls[i],
        isFeatured: i === 0,
        position: i,
      };
      await storage.createCoachImage(imageData);
    }
    
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
