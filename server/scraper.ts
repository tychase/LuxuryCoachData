import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';
import { InsertCoach, InsertCoachImage, InsertCoachFeature } from '@shared/schema';
import { log } from './vite';

// Base URL for scraping
const BASE_URL = 'https://prevost-stuff.com';

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
  
  // Start from page 1 and continue until no more coaches or max pages reached
  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const pageUrl = `${BASE_URL}/coaches?page=${currentPage}`;
    
    try {
      const { data } = await axios.get(pageUrl);
      const $ = cheerio.load(data);
      
      // Find coach listing links
      const links = $('a.coach-listing-link, a.coach-item, div.coach-listing a');
      
      if (links.length === 0) {
        // No more coaches found, stop pagination
        break;
      }
      
      // Extract URLs from the found links
      links.each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('/coach/')) {
          const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
          coachUrls.push(fullUrl);
        }
      });
      
      // Wait to avoid overwhelming the source server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      log(`Error scraping page ${currentPage}: ${error}`, 'scraper');
      break;
    }
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
    
    // Extract basic coach information
    const title = $('h1.coach-title, div.coach-title h1').text().trim();
    
    // Parse year, make, model from title
    const titleParts = parseCoachTitle(title);
    
    // Extract price
    let price = 0;
    const priceText = $('div.coach-price, span.price').text().trim();
    if (priceText) {
      // Strip non-numeric chars and convert to number
      price = parsePrice(priceText);
    }
    
    // Extract description
    const description = $('div.coach-description, div.description').text().trim();
    
    // Extract images
    const imageUrls: string[] = [];
    $('div.coach-images img, div.coach-gallery img').each((_, element) => {
      const imgSrc = $(element).attr('src') || $(element).attr('data-src');
      if (imgSrc) {
        const fullUrl = imgSrc.startsWith('http') ? imgSrc : `${BASE_URL}${imgSrc}`;
        imageUrls.push(fullUrl);
      }
    });
    
    // Extract featured image
    let featuredImage = imageUrls.length > 0 ? imageUrls[0] : '';
    
    // Extract features/specs
    const features: string[] = [];
    $('div.coach-features li, div.specs li, ul.features li').each((_, element) => {
      const feature = $(element).text().trim();
      if (feature) {
        features.push(feature);
      }
    });
    
    // Extract additional specs (mileage, length, etc.)
    let mileage = 0;
    let length = '';
    let slideCount = 0;
    let bedType = '';
    let exteriorColor = '';
    let interiorColor = '';
    
    // Try to extract specs from various table formats
    $('table.specs tr, div.coach-specs div.row').each((_, element) => {
      const label = $(element).find('th, td:first-child, div:first-child').text().trim().toLowerCase();
      const value = $(element).find('td:last-child, div:last-child').text().trim();
      
      if (label.includes('mileage')) {
        mileage = parseInt(value.replace(/\D/g, '')) || 0;
      } else if (label.includes('length')) {
        length = value;
      } else if (label.includes('slide')) {
        // Try to extract slide count
        const slideMatch = value.match(/(\d+)/);
        if (slideMatch) {
          slideCount = parseInt(slideMatch[1]);
        } else if (value.toLowerCase().includes('triple')) {
          slideCount = 3;
        } else if (value.toLowerCase().includes('quad')) {
          slideCount = 4;
        } else if (value.toLowerCase().includes('double')) {
          slideCount = 2;
        } else if (value.toLowerCase().includes('single')) {
          slideCount = 1;
        }
      } else if (label.includes('bed')) {
        bedType = value;
      } else if (label.includes('exterior') && label.includes('color')) {
        exteriorColor = value;
      } else if (label.includes('interior') && label.includes('color')) {
        interiorColor = value;
      }
    });
    
    // Construct coach data
    const coachData: InsertCoach = {
      title,
      year: titleParts.year || new Date().getFullYear(),
      make: titleParts.make || 'Unknown',
      model: titleParts.model || 'Unknown',
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
      sourceId,
      sourceUrl: url,
    };
    
    // Save coach to database
    const coach = await storage.createCoach(coachData);
    
    // Save coach images
    for (let i = 0; i < imageUrls.length; i++) {
      const imageData: InsertCoachImage = {
        coachId: coach.id,
        imageUrl: imageUrls[i],
        isFeatured: i === 0,
        sortOrder: i,
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
  const matches = url.match(/\/coach\/([^\/\?]+)/);
  return matches ? matches[1] : `source_${Date.now()}`;
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
