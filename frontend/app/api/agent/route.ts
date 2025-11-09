import { NextRequest, NextResponse } from 'next/server'

export type IntentType = 'property_discovery' | 'predictive_analytics' | 'chat' | 'document_intelligence' | 'insight_summarizer'

// Enhanced intent classification
function classifyIntent(query: string): IntentType {
  const lowerQuery = query.toLowerCase()
  
  // Document intelligence - ONLY trigger on explicit document/upload/PDF mentions
  // Very restrictive to avoid false positives from general queries
  // Examples: "analyze this PDF", "upload contract", "extract from document", "scan PDF file"
  if (
    lowerQuery.includes('pdf') ||
    (lowerQuery.includes('upload') && (lowerQuery.includes('document') || lowerQuery.includes('contract') || lowerQuery.includes('file') || lowerQuery.includes('pdf'))) ||
    (lowerQuery.includes('document') && (lowerQuery.includes('upload') || lowerQuery.includes('analyze') || lowerQuery.includes('extract') || lowerQuery.includes('scan') || lowerQuery.includes('read'))) ||
    (lowerQuery.includes('contract') && (lowerQuery.includes('upload') || lowerQuery.includes('analyze') || lowerQuery.includes('extract') || lowerQuery.includes('pdf') || lowerQuery.includes('document'))) ||
    (lowerQuery.includes('extract') && (lowerQuery.includes('pdf') || lowerQuery.includes('document') || lowerQuery.includes('contract') || lowerQuery.includes('clause'))) ||
    (lowerQuery.includes('scan') && (lowerQuery.includes('document') || lowerQuery.includes('pdf') || lowerQuery.includes('text'))) ||
    lowerQuery.includes('ocr') ||
    lowerQuery.includes('text recognition')
  ) {
    return 'document_intelligence'
  }
  
  // Property discovery - ONLY for explicit property search/listings queries
  // Check for action verbs that indicate searching/browsing properties
  const isPropertySearch = (
    // Explicit search actions
    lowerQuery.includes('search property') ||
    lowerQuery.includes('find property') ||
    lowerQuery.includes('show me property') ||
    lowerQuery.includes('show me houses') ||
    lowerQuery.includes('show me homes') ||
    lowerQuery.includes('show me apartments') ||
    lowerQuery.includes('show me listings') ||
    lowerQuery.includes('browse properties') ||
    lowerQuery.includes('browse houses') ||
    lowerQuery.includes('list properties') ||
    lowerQuery.includes('list houses') ||
    // Discovery actions
    (lowerQuery.includes('discover') && (lowerQuery.includes('property') || lowerQuery.includes('properties') || lowerQuery.includes('house') || lowerQuery.includes('home'))) ||
    // Search + property type combinations
    (lowerQuery.includes('search') && (lowerQuery.includes('property') || lowerQuery.includes('apartment') || lowerQuery.includes('home') || lowerQuery.includes('house')) && (lowerQuery.includes('for') || lowerQuery.includes('in') || lowerQuery.includes('under') || lowerQuery.includes('under'))) ||
    // Find + property type combinations with location/price filters
    (lowerQuery.includes('find') && (lowerQuery.includes('property') || lowerQuery.includes('apartment') || lowerQuery.includes('home') || lowerQuery.includes('house')) && (lowerQuery.includes('in') || lowerQuery.includes('under') || lowerQuery.includes('for sale') || lowerQuery.includes('to buy'))) ||
    // Buy/purchase with specific property search context
    ((lowerQuery.includes('buy') || lowerQuery.includes('purchase')) && (lowerQuery.includes('house') || lowerQuery.includes('home') || lowerQuery.includes('apartment') || lowerQuery.includes('property')) && (lowerQuery.includes('in') || lowerQuery.includes('under') || lowerQuery.includes('for'))) ||
    // Zillow/Airbnb - explicit property platforms
    lowerQuery.includes('zillow') ||
    lowerQuery.includes('airbnb') ||
    // Listing-specific queries
    (lowerQuery.includes('listing') && (lowerQuery.includes('show') || lowerQuery.includes('find') || lowerQuery.includes('search'))) ||
    (lowerQuery.includes('listings') && (lowerQuery.includes('show') || lowerQuery.includes('find') || lowerQuery.includes('search')))
  )
  
  if (isPropertySearch) {
    return 'property_discovery'
  }
  
  // Predictive analytics - market trends, forecasts, predictions
  if (
    lowerQuery.includes('forecast') ||
    lowerQuery.includes('predict') ||
    lowerQuery.includes('prediction') ||
    lowerQuery.includes('trend') ||
    lowerQuery.includes('trends') ||
    lowerQuery.includes('growth') ||
    lowerQuery.includes('analytics') ||
    lowerQuery.includes('chart') ||
    lowerQuery.includes('graph') ||
    lowerQuery.includes('visualize') ||
    lowerQuery.includes('metric') ||
    lowerQuery.includes('kpi') ||
    (lowerQuery.includes('analyze') && (lowerQuery.includes('market') || lowerQuery.includes('trend') || lowerQuery.includes('performance') || lowerQuery.includes('portfolio')))
  ) {
    return 'predictive_analytics'
  }
  
  // General real estate questions about markets, cities, investment advice
  // These should go to chat/insights, not property discovery
  const isGeneralRealEstateQuestion = (
    // Why questions about real estate
    (lowerQuery.startsWith('why') && (lowerQuery.includes('real estate') || lowerQuery.includes('property') || lowerQuery.includes('investment') || lowerQuery.includes('market'))) ||
    // What questions about real estate
    (lowerQuery.startsWith('what') && (lowerQuery.includes('real estate') || lowerQuery.includes('property market') || lowerQuery.includes('investment') || lowerQuery.includes('market trend'))) ||
    // How questions about real estate
    (lowerQuery.startsWith('how') && (lowerQuery.includes('real estate') || lowerQuery.includes('property investment') || lowerQuery.includes('market'))) ||
    // Is/Are questions about markets or cities
    ((lowerQuery.startsWith('is') || lowerQuery.startsWith('are')) && (lowerQuery.includes('good place') || lowerQuery.includes('good market') || lowerQuery.includes('good investment') || lowerQuery.includes('worth investing'))) ||
    // City + real estate questions (e.g., "Why is Austin a good place to do real estate?")
    ((lowerQuery.includes('austin') || lowerQuery.includes('dallas') || lowerQuery.includes('houston') || lowerQuery.includes('city') || lowerQuery.includes('cities')) && (lowerQuery.includes('good place') || lowerQuery.includes('good market') || lowerQuery.includes('real estate') || lowerQuery.includes('investment') || lowerQuery.includes('worth'))) ||
    // Market condition questions
    (lowerQuery.includes('market condition') || lowerQuery.includes('market outlook') || lowerQuery.includes('market analysis') || lowerQuery.includes('market performance')) ||
    // Investment advice questions
    (lowerQuery.includes('should i invest') || lowerQuery.includes('worth investing') || lowerQuery.includes('good investment') || lowerQuery.includes('investment opportunity'))
  )
  
  if (isGeneralRealEstateQuestion) {
    // Route to insight_summarizer for comprehensive answers, or chat for conversational responses
    // Check if it's a pros/cons type question
    if (lowerQuery.includes('pros') || lowerQuery.includes('cons') || lowerQuery.includes('advantages') || lowerQuery.includes('disadvantages')) {
      return 'insight_summarizer'
    }
    // Otherwise, route to chat for general Q&A
    return 'chat'
  }
  
  // Insight summarizer - summaries, insights, pros/cons, comparisons
  if (
    lowerQuery.includes('insight') ||
    lowerQuery.includes('insights') ||
    lowerQuery.includes('summarize') ||
    lowerQuery.includes('summary') ||
    lowerQuery.includes('overview') ||
    lowerQuery.includes('dashboard') ||
    lowerQuery.includes('combine') ||
    lowerQuery.includes('consolidate') ||
    lowerQuery.includes('all data') ||
    lowerQuery.includes('pros') ||
    lowerQuery.includes('cons') ||
    lowerQuery.includes('compare') ||
    lowerQuery.includes('comparison')
  ) {
    return 'insight_summarizer'
  }
  
  // Default to chat for general conversational queries
  return 'chat'
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const intent = classifyIntent(query)

    let response: any = {
      type: intent,
      title: '',
      content: '',
      data: null,
    }

    // Property Discovery Response
    if (intent === 'property_discovery') {
      try {
        // Fetch listings from backend MongoDB API
        const backendUrl = process.env.NEXT_PUBLIC_CREWAI_API_URL || 'http://localhost:8000'
        const listingsResponse = await fetch(`${backendUrl}/listings?limit=100`)
        
        if (!listingsResponse.ok) {
          throw new Error(`Backend API error: ${listingsResponse.status}`)
        }
        
        const listingsData = await listingsResponse.json()
        const listings = listingsData.listings || []
        
        // Debug: Log first listing to see actual data structure
        if (listings.length > 0) {
          console.log('Sample listing from MongoDB:', JSON.stringify(listings[0], null, 2))
        }
        
        // Transform MongoDB listings to frontend Property format
        const transformedProperties = listings.map((listing: any, index: number) => {
          // Generate a unique ID - handle different _id formats
          let id: string
          if (listing._id) {
            if (typeof listing._id === 'string') {
              id = listing._id
            } else if (listing._id.$oid) {
              id = listing._id.$oid
            } else if (listing._id.toString) {
              id = listing._id.toString()
            } else {
              id = `listing-${index}`
            }
          } else {
            id = `listing-${index}`
          }
          
          // Format price
          const price = listing.listing_price 
            ? `$${listing.listing_price.toLocaleString()}` 
            : 'Price not available'
          
          // Format address
          const address = listing.address 
            ? `${listing.address}${listing.city ? `, ${listing.city}` : ''}${listing.state ? `, ${listing.state}` : ''}`
            : 'Address not available'
          
          // Format square footage
          const sqft = listing.square_footage 
            ? `${listing.square_footage.toLocaleString()} sq ft`
            : 'N/A'
          
          // Build tags array from property features
          const tags: string[] = []
          if (listing.pool) tags.push('Pool')
          if (listing.fireplace) tags.push('Fireplace')
          if (listing.garage_spaces && listing.garage_spaces > 0) tags.push('Garage')
          if (listing.air_conditioning) tags.push('AC')
          if (tags.length === 0) tags.push(listing.property_type || 'Property')
          
          // Default image (you might want to use listing.photos if available)
          const image = listing.photos && listing.photos.length > 0
            ? listing.photos[0]
            : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'
          
          return {
            id,
            title: listing.address || `Property ${index + 1}`,
            address,
            price,
            rating: 4.5, // Default rating (you might calculate this from listing data)
            image,
            type: listing.property_type || 'Property',
            beds: listing.bedrooms ?? null, // Use nullish coalescing to preserve 0 values
            baths: listing.bathrooms ?? null,
            sqft,
            tags,
            images: listing.photos || [image],
            description: listing.description || `${listing.property_type || 'Property'} in ${listing.city || 'the area'}`,
            rooms: listing.bedrooms ?? null, // Use bedrooms as rooms for now
            kitchens: null, // Not available in MongoDB schema
            garage: listing.garage_spaces ?? null,
          }
        })
        
        response.title = 'Property Discovery'
        response.content = `Found ${transformedProperties.length} properties matching your search criteria.`
        response.data = {
          properties: transformedProperties,
          filters: {
            locations: [...new Set(listings.map((l: any) => `${l.city || ''}, ${l.state || ''}`).filter(Boolean))],
            priceRange: {
              min: listings.length > 0 ? Math.min(...listings.map((l: any) => l.listing_price || 0).filter((p: number) => p > 0)) : 0,
              max: listings.length > 0 ? Math.max(...listings.map((l: any) => l.listing_price || 0)) : 0,
            },
            propertyTypes: [...new Set(listings.map((l: any) => l.property_type).filter(Boolean))],
            amenities: ['Pool', 'Garage', 'Fireplace', 'AC'],
          },
        }
      } catch (error) {
        console.error('Error fetching listings from backend:', error)
        // Fallback to empty results or show error message
        response.title = 'Property Discovery'
        response.content = 'Unable to fetch properties from database. Please check if the backend server is running.'
        response.data = {
          properties: [],
          filters: {},
        }
      }
    }
    // Predictive Analytics Response
    else if (intent === 'predictive_analytics') {
      response.title = 'Predictive Analytics'
      response.content = 'Forecasting portfolio performance and market trends.'
      response.data = {
        metrics: [
          {
            label: 'Avg. Asset Value',
            value: '$98,134',
            change: '+2.4%',
            trend: 'up',
            subtext: 'vs last month',
            sparklineData: [
              { value: 92000 }, { value: 93500 }, { value: 91800 },
              { value: 94200 }, { value: 95800 }, { value: 97100 },
              { value: 98134 }
            ],
            comparisonBadge: { text: 'Above target', type: 'success' },
            tooltipText: 'Average portfolio asset value trending upward'
          },
          {
            label: 'Market Efficiency',
            value: '86%',
            change: '+1.2%',
            trend: 'up',
            subtext: '↑ Improving trend',
            sparklineData: [
              { value: 82 }, { value: 83 }, { value: 84 },
              { value: 83.5 }, { value: 85 }, { value: 85.5 },
              { value: 86 }
            ],
            comparisonBadge: { text: 'Strong performance', type: 'success' },
            tooltipText: 'Portfolio efficiency compared to market average'
          },
          {
            label: 'Risk Factor',
            value: '14%',
            change: '+0.8%',
            trend: 'up',
            subtext: '⚠ High risk cluster',
            sparklineData: [
              { value: 12 }, { value: 12.5 }, { value: 13 },
              { value: 13.2 }, { value: 13.8 }, { value: 14.2 },
              { value: 14 }
            ],
            comparisonBadge: { text: 'Needs attention', type: 'warning' },
            tooltipText: 'Overall portfolio risk level - monitor closely'
          },
        ],
        predictions: [
          { assetType: 'Residential Properties', dropRisk: 0.12, reason: 'Energy inefficiency', assetId: 'residential' },
          { assetType: 'Commercial Buildings', dropRisk: 0.07, reason: 'Market oversupply', assetId: 'commercial' },
          { assetType: 'Multi-Family Units', dropRisk: 0.04, reason: 'Stable demand', assetId: 'multifamily' },
          { assetType: 'Industrial Facilities', dropRisk: 0.09, reason: 'Rising maintenance costs', assetId: 'industrial' },
          { assetType: 'Mixed-Use Properties', dropRisk: 0.06, reason: 'Moderate risk', assetId: 'mixeduse' },
          { assetType: 'Vacant Land', dropRisk: 0.03, reason: 'Strong growth signals', assetId: 'land' },
        ],
        insights: [
          {
            title: '⚠️ Value Drop Risk — 12%',
            description: 'Energy inefficiency and rising maintenance costs detected in residential properties across Texas.',
            confidence: 84,
            type: 'warning',
            assetId: 'residential'
          },
          {
            title: '📈 Growth Signal — Commercial',
            description: 'Strong demand indicators for commercial buildings despite slight oversupply. Consider strategic expansion.',
            confidence: 91,
            type: 'growth',
            assetId: 'commercial'
          },
          {
            title: '🚨 Market Oversupply Alert',
            description: 'Commercial buildings showing 7% oversupply. Monitor pricing trends closely.',
            confidence: 78,
            type: 'alert',
            assetId: 'commercial'
          },
          {
            title: '✅ Stable Performance — Multi-Family',
            description: 'Multi-family units show consistent demand and low risk factors. Maintain current strategy.',
            confidence: 95,
            type: 'growth',
            assetId: 'multifamily'
          },
        ],
        modelStats: {
          accuracy: '94.2%',
          datasetSize: '12.3k entries'
        }
      }
    }
    // Chat Response - general conversational queries
    else if (intent === 'chat') {
      response.title = 'Chat'
      const lowerQuery = query.toLowerCase()
      
      // Generate contextual responses for general queries (NO document/OCR mentions)
      if (lowerQuery.includes('what can you do') || lowerQuery.includes('what do you do') || lowerQuery.includes('help')) {
        response.content = 'I\'m CURA, your AI real estate analyst. I can help you with:\n\n• Discover and search for properties\n• Predict market trends and analytics\n• Analyze property insights and performance\n• Compare property portfolios by ROI\n• Answer questions about real estate markets\n\nWhat would you like to explore?'
      } else if (lowerQuery.includes('why') && (lowerQuery.includes('austin') || lowerQuery.includes('dallas') || lowerQuery.includes('houston') || lowerQuery.includes('city') || lowerQuery.includes('good place') || lowerQuery.includes('real estate'))) {
        // City-specific real estate questions
        const cityMatch = lowerQuery.match(/\b(austin|dallas|houston|san antonio|fort worth|plano|arlington|irving)\b/)
        const city = cityMatch ? cityMatch[1] : 'this area'
        const cityCapitalized = city.charAt(0).toUpperCase() + city.slice(1)
        
        // City-specific insights
        const cityInsights: Record<string, string[]> = {
          austin: [
            '**Tech Hub Growth**: Austin is a major technology hub with companies like Tesla, Apple, and Google establishing major operations, driving job growth and population influx',
            '**Strong Job Market**: Diverse economy with technology, healthcare, education, and government sectors providing stable employment opportunities',
            '**Population Growth**: One of the fastest-growing cities in the US, with consistent population growth driving housing demand',
            '**Cultural Appeal**: Vibrant music scene, outdoor recreation, and quality of life attract young professionals and families',
            '**Affordable Compared to Coastal Cities**: More affordable than San Francisco, New York, or Seattle while offering similar amenities',
            '**Business-Friendly Environment**: Texas has no state income tax and business-friendly regulations',
            '**Quality Education**: Strong school districts and proximity to University of Texas',
            '**Infrastructure Development**: Ongoing infrastructure improvements and development projects enhance property values',
          ],
          dallas: [
            '**Economic Powerhouse**: Major corporate headquarters including AT&T, Southwest Airlines, and Texas Instruments',
            '**Diverse Economy**: Strong in finance, technology, healthcare, and logistics sectors',
            '**Central Location**: Strategic location as a transportation hub with major airport and logistics infrastructure',
            '**Affordable Housing**: More affordable than many major metros while offering big-city amenities',
            '**Job Growth**: Consistent job growth across multiple industries',
            '**Population Growth**: Steady population growth drives housing demand',
            '**Business-Friendly**: No state income tax and pro-business environment',
            '**Quality Schools**: Strong school districts and educational institutions',
          ],
          houston: [
            '**Energy Industry Hub**: Major center for oil and gas industry with diverse energy companies',
            '**Healthcare Excellence**: World-renowned Texas Medical Center, the largest medical complex in the world',
            '**Affordable Cost of Living**: Lower cost of living compared to other major metros',
            '**Diverse Population**: One of the most diverse cities in the US',
            '**Port and Logistics**: Major port city with strong international trade',
            '**Job Opportunities**: Diverse economy with opportunities in energy, healthcare, aerospace, and manufacturing',
            '**No Zoning Laws**: Flexible development allows for innovative real estate projects',
            '**Cultural Amenities**: Museums, theaters, and diverse dining options',
          ],
        }
        
        const insights = cityInsights[city] || [
          '**Strong Economic Growth**: Major job market with diverse industries',
          '**Population Growth**: Rapid population increase drives housing demand and property values',
          '**Affordable Compared to Coastal Cities**: Offers better value than markets like San Francisco or New York',
          '**Business-Friendly Environment**: Low taxes and regulations attract businesses and residents',
          '**Quality of Life**: Great schools, cultural amenities, and outdoor recreation',
          '**Diverse Property Options**: Range from urban condos to suburban single-family homes',
          '**Rental Market Strength**: Strong rental demand supports investment properties',
          '**Future Development**: Ongoing infrastructure and development projects enhance property values',
        ]
        
        response.content = `${cityCapitalized} is an excellent real estate market for several reasons:\n\n${insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n\n')}\n\nWould you like me to analyze specific neighborhoods in ${cityCapitalized}, provide market trends, or help you search for properties in the area?`
      } else if (lowerQuery.includes('good place') || lowerQuery.includes('good market') || lowerQuery.includes('worth investing')) {
        response.content = `Real estate investment depends on several factors:\n\n• **Location Quality**: Areas with job growth, good schools, and amenities tend to appreciate\n• **Market Conditions**: Current supply/demand dynamics and price trends\n• **Economic Fundamentals**: Local economy strength and population growth\n• **Property Type**: Different property types (single-family, condos, commercial) have different risk/return profiles\n• **Your Goals**: Short-term flip vs. long-term rental income\n• **Market Timing**: Current interest rates and market cycle position\n\nWould you like me to analyze a specific market, compare cities, or provide predictive analytics for your investment goals?`
      } else if (lowerQuery.includes('should i invest') || lowerQuery.includes('investment advice')) {
        response.content = `Real estate investment decisions should consider:\n\n• **Financial Readiness**: Down payment, credit score, and ongoing expenses\n• **Market Analysis**: Local market conditions, trends, and forecasts\n• **Property Analysis**: Specific property evaluation including ROI and cash flow\n• **Risk Assessment**: Market risks, property condition, and economic factors\n• **Investment Strategy**: Buy-and-hold, fix-and-flip, or commercial investment\n• **Diversification**: How real estate fits into your overall portfolio\n\nI can help you analyze properties, compare markets, evaluate investment opportunities, and provide predictive analytics. What specific aspect would you like to explore?`
      } else if (lowerQuery.includes('tell me about') || lowerQuery.includes('explain')) {
        response.content = `I'd be happy to help explain "${query}". Could you provide more context? For example:\n\n• Are you asking about a specific property?\n• Do you need market analytics or predictions?\n• Are you looking for property insights or comparisons?\n\nFeel free to ask me anything about real estate!`
      } else if (lowerQuery.includes('market') || lowerQuery.includes('trends')) {
        response.content = 'The real estate market is showing strong growth indicators. Would you like me to:\n\n• Analyze specific market trends?\n• Provide predictive analytics?\n• Show you property discoveries?\n• Compare portfolio performance?\n\nJust ask, and I\'ll dive deeper into the data!'
      } else {
        response.content = `I understand you're asking about "${query}". As your AI real estate analyst, I can help you with:\n\n• Property discovery and search\n• Market analysis and trends\n• Investment advice and ROI calculations\n• Property comparisons and pros/cons\n• Predictive analytics and forecasts\n\nWhat specific information would you like? You can ask me about markets, properties, investments, or any real estate-related topic.`
      }
    }
    // Document Intelligence Response
    else if (intent === 'document_intelligence') {
      response.title = 'Document Intelligence'
      response.content = 'Extracted key information from uploaded documents.'
      response.data = {
        documents: [
          {
            name: 'Plano HQ Lease Agreement',
            type: 'Commercial Lease',
            extracted: {
              'Lease Term': '5 years',
              'Monthly Rent': '$45,000',
              'Expiration Date': '2026-03-15',
              'Renewal Option': 'Yes',
              'Energy Clause': 'Tenant responsible for utilities',
              'Maintenance': 'Shared responsibility',
            },
            clauses: [
              'Early termination penalty: 3 months rent',
              'Maintenance responsibilities: Shared between landlord and tenant',
              'Expansion rights: Available with 90-day notice',
              'Sublease permitted with written approval',
            ],
            risks: [
              'Expiration in 14 months - renewal negotiations should begin',
              'Energy costs not capped - potential for increases',
            ],
            compliance: 95,
          },
          {
            name: 'Dallas Tower Lease Agreement',
            type: 'Office Lease',
            extracted: {
              'Lease Term': '3 years',
              'Monthly Rent': '$38,000',
              'Expiration Date': '2025-06-30',
              'Renewal Option': 'Yes',
              'Energy Clause': 'Landlord covers HVAC',
              'Maintenance': 'Landlord responsible',
            },
            clauses: [
              'Sublease permitted with approval',
              'Parking included: 10 spaces',
              'Common area maintenance: Pro-rated',
              'No early termination clause',
            ],
            risks: [
              'Expiring in 7 months - urgent action required',
              'No early termination option - locked in until expiration',
            ],
            compliance: 88,
          },
        ],
        summary: {
          totalDocuments: 2,
          totalClauses: 8,
          expiringSoon: 1,
          averageCompliance: 91.5,
          totalMonthlyRent: '$83,000',
        },
      }
    }
    // Insight Summarizer Response
    else if (intent === 'insight_summarizer') {
      const lowerQuery = query.toLowerCase()
      const isProsConsQuery = lowerQuery.includes('pros') || lowerQuery.includes('cons') || lowerQuery.includes('pros and cons')
      const isComparisonQuery = lowerQuery.includes('compare') || lowerQuery.includes('comparison') || lowerQuery.includes('versus') || lowerQuery.includes('vs')
      
      // Try to fetch property data for context-specific analysis
      let propertyData: any[] = []
      let comparisonProperties: any[] = []
      
      try {
        const backendUrl = process.env.NEXT_PUBLIC_CREWAI_API_URL || 'http://localhost:8000'
        const listingsResponse = await fetch(`${backendUrl}/listings?limit=100`)
        
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json()
          const listings = listingsData.listings || []
          
          // Extract property references from query (addresses, cities, property types)
          const queryWords = query.split(/\s+/).map(w => w.toLowerCase().replace(/[.,!?]/g, ''))
          const cities = ['dallas', 'austin', 'houston', 'san antonio', 'fort worth', 'plano', 'arlington', 'irving']
          const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'villa', 'home', 'property']
          
          // Find properties mentioned in query
          const mentionedCities = cities.filter(city => queryWords.some(word => word.includes(city) || city.includes(word)))
          const mentionedTypes = propertyTypes.filter(type => queryWords.includes(type))
          
          // Filter properties based on query
          if (mentionedCities.length > 0 || mentionedTypes.length > 0) {
            propertyData = listings.filter((listing: any) => {
              const listingCity = listing.city?.toLowerCase() || ''
              const listingType = listing.property_type?.toLowerCase() || ''
              return mentionedCities.some(city => listingCity.includes(city)) || 
                     mentionedTypes.some(type => listingType.includes(type))
            })
          }
          
          // For comparison queries, try to get 2+ properties
          if (isComparisonQuery && propertyData.length >= 2) {
            comparisonProperties = propertyData.slice(0, 2)
          } else if (propertyData.length > 0) {
            propertyData = propertyData.slice(0, 1) // Single property analysis
          } else if (listings.length > 0) {
            // Default to first few properties if no specific match
            propertyData = isComparisonQuery ? listings.slice(0, 2) : listings.slice(0, 1)
          }
        }
      } catch (error) {
        console.error('Error fetching property data for pros/cons:', error)
      }
      
      response.title = isComparisonQuery && comparisonProperties.length >= 2
        ? `Property Comparison: ${comparisonProperties[0]?.address || 'Property 1'} vs ${comparisonProperties[1]?.address || 'Property 2'}`
        : isProsConsQuery && propertyData.length > 0
        ? `Pros & Cons: ${propertyData[0]?.address || 'Property Analysis'}`
        : isProsConsQuery
        ? 'Pros & Cons Analysis'
        : 'Insight Summary Dashboard'
      
      response.content = isComparisonQuery && comparisonProperties.length >= 2
        ? `Detailed comparison analysis between ${comparisonProperties.length} properties.`
        : isProsConsQuery && propertyData.length > 0
        ? `Property-specific pros and cons analysis based on actual property data.`
        : isProsConsQuery
        ? 'Comprehensive pros and cons analysis for your property investment.'
        : 'Comprehensive overview combining insights from multiple data sources.'
      
      if (isProsConsQuery) {
        // Generate property-specific pros/cons
        if (isComparisonQuery && comparisonProperties.length >= 2) {
          // Comparison mode - compare two properties
          const prop1 = comparisonProperties[0]
          const prop2 = comparisonProperties[1]
          
          const generateComparisonProsCons = (prop1: any, prop2: any) => {
            const pros: string[] = []
            const cons: string[] = []
            
            // Price comparison
            if (prop1.listing_price && prop2.listing_price) {
              if (prop1.listing_price < prop2.listing_price) {
                pros.push(`${prop1.address || 'Property 1'} is $${(prop2.listing_price - prop1.listing_price).toLocaleString()} cheaper than ${prop2.address || 'Property 2'}`)
                cons.push(`${prop2.address || 'Property 2'} is more expensive, but may offer better value`)
              } else {
                pros.push(`${prop2.address || 'Property 2'} offers better price per square foot`)
                cons.push(`${prop1.address || 'Property 1'} is more expensive than ${prop2.address || 'Property 2'}`)
              }
            }
            
            // Size comparison
            if (prop1.square_footage && prop2.square_footage) {
              if (prop1.square_footage > prop2.square_footage) {
                pros.push(`${prop1.address || 'Property 1'} has ${(prop1.square_footage - prop2.square_footage).toLocaleString()} more square feet`)
                cons.push(`${prop2.address || 'Property 2'} is smaller but may be more efficient`)
              } else {
                pros.push(`${prop2.address || 'Property 2'} offers more space (${prop2.square_footage.toLocaleString()} sq ft)`)
                cons.push(`${prop1.address || 'Property 1'} has less square footage`)
              }
            }
            
            // Bedroom comparison
            if (prop1.bedrooms && prop2.bedrooms) {
              if (prop1.bedrooms > prop2.bedrooms) {
                pros.push(`${prop1.address || 'Property 1'} has ${prop1.bedrooms} bedrooms vs ${prop2.bedrooms} in ${prop2.address || 'Property 2'}`)
              } else if (prop2.bedrooms > prop1.bedrooms) {
                pros.push(`${prop2.address || 'Property 2'} has more bedrooms (${prop2.bedrooms} vs ${prop1.bedrooms})`)
              }
            }
            
            // Bathroom comparison
            if (prop1.bathrooms && prop2.bathrooms) {
              if (prop1.bathrooms > prop2.bathrooms) {
                pros.push(`${prop1.address || 'Property 1'} has more bathrooms (${prop1.bathrooms} vs ${prop2.bathrooms})`)
              } else if (prop2.bathrooms > prop1.bathrooms) {
                pros.push(`${prop2.address || 'Property 2'} offers more bathrooms`)
              }
            }
            
            // Location comparison
            if (prop1.city && prop2.city && prop1.city !== prop2.city) {
              pros.push(`Location comparison: ${prop1.city} vs ${prop2.city} - different market dynamics`)
              cons.push(`Properties in different cities may have varying tax rates and regulations`)
            }
            
            // Amenities comparison
            const prop1Amenities = []
            const prop2Amenities = []
            if (prop1.pool) prop1Amenities.push('Pool')
            if (prop1.fireplace) prop1Amenities.push('Fireplace')
            if (prop1.garage_spaces > 0) prop1Amenities.push(`${prop1.garage_spaces} garage spaces`)
            if (prop2.pool) prop2Amenities.push('Pool')
            if (prop2.fireplace) prop2Amenities.push('Fireplace')
            if (prop2.garage_spaces > 0) prop2Amenities.push(`${prop2.garage_spaces} garage spaces`)
            
            if (prop1Amenities.length > prop2Amenities.length) {
              pros.push(`${prop1.address || 'Property 1'} has more amenities: ${prop1Amenities.join(', ')}`)
            } else if (prop2Amenities.length > prop1Amenities.length) {
              pros.push(`${prop2.address || 'Property 2'} offers more amenities: ${prop2Amenities.join(', ')}`)
            }
            
            // Property type
            if (prop1.property_type && prop2.property_type && prop1.property_type !== prop2.property_type) {
              pros.push(`Different property types: ${prop1.property_type} vs ${prop2.property_type} - consider your lifestyle needs`)
            }
            
            // Price per square foot
            if (prop1.listing_price && prop1.square_footage && prop2.listing_price && prop2.square_footage) {
              const pricePerSqft1 = prop1.listing_price / prop1.square_footage
              const pricePerSqft2 = prop2.listing_price / prop2.square_footage
              if (pricePerSqft1 < pricePerSqft2) {
                pros.push(`${prop1.address || 'Property 1'} offers better value at $${pricePerSqft1.toFixed(2)}/sq ft vs $${pricePerSqft2.toFixed(2)}/sq ft`)
              } else {
                pros.push(`${prop2.address || 'Property 2'} has better price per square foot`)
              }
            }
            
            return { pros, cons }
          }
          
          const comparison = generateComparisonProsCons(prop1, prop2)
          
          response.data = {
            kpis: [
              { label: 'Property 1 Price', value: prop1.listing_price ? `$${prop1.listing_price.toLocaleString()}` : 'N/A', change: prop1.square_footage ? `$${Math.round((prop1.listing_price || 0) / prop1.square_footage)}/sqft` : '' },
              { label: 'Property 2 Price', value: prop2.listing_price ? `$${prop2.listing_price.toLocaleString()}` : 'N/A', change: prop2.square_footage ? `$${Math.round((prop2.listing_price || 0) / prop2.square_footage)}/sqft` : '' },
              { label: 'Price Difference', value: prop1.listing_price && prop2.listing_price ? `$${Math.abs(prop1.listing_price - prop2.listing_price).toLocaleString()}` : 'N/A', change: prop1.listing_price && prop2.listing_price ? (prop1.listing_price < prop2.listing_price ? 'Property 1 cheaper' : 'Property 2 cheaper') : '' },
              { label: 'Size Difference', value: prop1.square_footage && prop2.square_footage ? `${Math.abs(prop1.square_footage - prop2.square_footage).toLocaleString()} sqft` : 'N/A', change: prop1.square_footage && prop2.square_footage ? (prop1.square_footage > prop2.square_footage ? 'Property 1 larger' : 'Property 2 larger') : '' },
              { label: 'Best Value', value: (prop1.listing_price && prop1.square_footage && prop2.listing_price && prop2.square_footage) ? ((prop1.listing_price / prop1.square_footage) < (prop2.listing_price / prop2.square_footage) ? 'Property 1' : 'Property 2') : 'N/A', change: 'Better $/sqft' },
            ],
            pros: comparison.pros.length > 0 ? comparison.pros : [
              `Property 1 (${prop1.address || 'Property 1'}): ${prop1.bedrooms || 'N/A'} beds, ${prop1.bathrooms || 'N/A'} baths, ${prop1.square_footage?.toLocaleString() || 'N/A'} sqft`,
              `Property 2 (${prop2.address || 'Property 2'}): ${prop2.bedrooms || 'N/A'} beds, ${prop2.bathrooms || 'N/A'} baths, ${prop2.square_footage?.toLocaleString() || 'N/A'} sqft`,
              'Direct comparison allows for informed decision-making',
              'Both properties have different strengths and considerations',
            ],
            cons: comparison.cons.length > 0 ? comparison.cons : [
              'Properties may have different maintenance requirements',
              'Location factors vary between the two properties',
              'Market conditions may affect each property differently',
              'Consider long-term investment potential for both',
            ],
            topInsights: [
              `Property 1 located in ${prop1.city || 'unknown location'}, Property 2 in ${prop2.city || 'unknown location'}`,
              prop1.listing_price && prop2.listing_price ? `Price difference: $${Math.abs(prop1.listing_price - prop2.listing_price).toLocaleString()}` : 'Compare pricing carefully',
              prop1.square_footage && prop2.square_footage ? `Size difference: ${Math.abs(prop1.square_footage - prop2.square_footage).toLocaleString()} square feet` : 'Consider space requirements',
              'Evaluate based on your specific needs and investment goals',
            ],
            recommendations: [
              'Visit both properties to assess condition and neighborhood',
              'Compare property taxes and HOA fees for accurate cost analysis',
              'Consider resale value and market trends for each location',
              'Evaluate financing options and down payment requirements',
            ],
            chartData: [
              { name: 'Property 1', value: prop1.listing_price || 0, forecast: null },
              { name: 'Property 2', value: prop2.listing_price || 0, forecast: null },
            ],
            property1: prop1,
            property2: prop2,
          }
        } else if (propertyData.length > 0) {
          // Single property analysis - generate property-specific pros/cons
          const property = propertyData[0]
          
          const generatePropertyProsCons = (prop: any) => {
            const pros: string[] = []
            const cons: string[] = []
            
            // Price-based pros/cons
            if (prop.listing_price) {
              if (prop.listing_price < 300000) {
                pros.push(`Affordable price point at $${prop.listing_price.toLocaleString()} - good entry-level investment`)
              } else if (prop.listing_price > 500000) {
                pros.push(`Premium property at $${prop.listing_price.toLocaleString()} - high-end market positioning`)
                cons.push(`Higher price point may limit buyer pool and require larger down payment`)
              }
              
              // Price per square foot
              if (prop.square_footage && prop.listing_price) {
                const pricePerSqft = prop.listing_price / prop.square_footage
                if (pricePerSqft < 150) {
                  pros.push(`Excellent value at $${pricePerSqft.toFixed(2)} per square foot - below market average`)
                } else if (pricePerSqft > 250) {
                  cons.push(`Higher price per square foot at $${pricePerSqft.toFixed(2)} - premium pricing`)
                }
              }
            }
            
            // Size-based pros/cons
            if (prop.square_footage) {
              if (prop.square_footage > 2000) {
                pros.push(`Spacious ${prop.square_footage.toLocaleString()} square feet - ideal for families or home offices`)
              } else if (prop.square_footage < 1000) {
                pros.push(`Compact ${prop.square_footage.toLocaleString()} square feet - efficient use of space, lower maintenance`)
                cons.push(`Limited square footage may not suit larger families or those needing more space`)
              }
            }
            
            // Bedroom/bathroom analysis
            if (prop.bedrooms) {
              if (prop.bedrooms >= 3) {
                pros.push(`${prop.bedrooms} bedrooms provide flexibility for families, guests, or home offices`)
              } else if (prop.bedrooms < 2) {
                pros.push(`Cozy ${prop.bedrooms} bedroom layout - perfect for singles or couples`)
                cons.push(`Limited bedrooms may not accommodate growing families`)
              }
            }
            
            if (prop.bathrooms) {
              if (prop.bathrooms >= 2) {
                pros.push(`${prop.bathrooms} bathrooms reduce morning congestion and add convenience`)
              } else {
                cons.push(`Single bathroom may be limiting for multiple occupants`)
              }
            }
            
            // Location-based
            if (prop.city) {
              pros.push(`Located in ${prop.city} - research local market trends and growth potential`)
              if (['dallas', 'austin', 'houston'].includes(prop.city.toLowerCase())) {
                pros.push(`Major Texas metro area with strong job market and population growth`)
              }
            }
            
            if (prop.state) {
              pros.push(`${prop.state} location - consider state tax implications and regulations`)
            }
            
            // Property type
            if (prop.property_type) {
              const type = prop.property_type.toLowerCase()
              if (type.includes('single') || type.includes('house')) {
                pros.push('Single-family home offers privacy, yard space, and no shared walls')
                cons.push('Single-family homes typically require more maintenance and higher property taxes')
              } else if (type.includes('condo') || type.includes('apartment')) {
                pros.push('Condo/Apartment living offers lower maintenance and shared amenities')
                cons.push('HOA fees and shared walls are considerations for condo/apartment living')
              } else if (type.includes('townhouse')) {
                pros.push('Townhouse combines single-family benefits with lower maintenance')
              }
            }
            
            // Amenities
            if (prop.pool) {
              pros.push('Private pool adds significant value and entertainment options')
              cons.push('Pool maintenance requires ongoing costs (cleaning, chemicals, repairs)')
            }
            
            if (prop.fireplace) {
              pros.push('Fireplace adds ambiance and can serve as backup heating source')
            }
            
            if (prop.garage_spaces) {
              if (prop.garage_spaces >= 2) {
                pros.push(`${prop.garage_spaces} garage spaces provide ample parking and storage`)
              } else {
                cons.push(`Limited garage space (${prop.garage_spaces}) may require street parking`)
              }
            }
            
            if (prop.air_conditioning) {
              pros.push('Air conditioning essential for comfort in warmer climates')
            } else {
              cons.push('No air conditioning listed - may need to install, adding to costs')
            }
            
            // Year built (if available)
            if (prop.year_built) {
              const age = new Date().getFullYear() - prop.year_built
              if (age < 10) {
                pros.push(`New construction (${prop.year_built}) - modern systems and fewer immediate repairs`)
              } else if (age > 30) {
                pros.push(`Established neighborhood with mature trees and character (built ${prop.year_built})`)
                cons.push(`Older home (${age} years) may require updates to HVAC, plumbing, or electrical systems`)
              }
            }
            
            // Market positioning
            if (prop.listing_price && prop.square_footage) {
              const pricePerSqft = prop.listing_price / prop.square_footage
              if (pricePerSqft < 100) {
                pros.push('Exceptional value - significantly below typical market rates')
              }
            }
            
            return { pros, cons }
          }
          
          const analysis = generatePropertyProsCons(property)
          
          // Ensure we have at least some pros/cons
          if (analysis.pros.length === 0) {
            analysis.pros.push('Property located in a developing area with growth potential')
            analysis.pros.push('Consider location advantages and neighborhood amenities')
          }
          if (analysis.cons.length === 0) {
            analysis.cons.push('Conduct thorough inspection before purchase')
            analysis.cons.push('Research property history and any potential issues')
          }
          
          response.data = {
            kpis: [
              { label: 'Property Price', value: property.listing_price ? `$${property.listing_price.toLocaleString()}` : 'N/A', change: property.square_footage && property.listing_price ? `$${Math.round(property.listing_price / property.square_footage)}/sqft` : '' },
              { label: 'Square Feet', value: property.square_footage ? `${property.square_footage.toLocaleString()}` : 'N/A', change: property.bedrooms ? `${property.bedrooms} beds` : '' },
              { label: 'Bedrooms', value: property.bedrooms?.toString() || 'N/A', change: property.bathrooms ? `${property.bathrooms} baths` : '' },
              { label: 'Property Type', value: property.property_type || 'N/A', change: property.city || '' },
              { label: 'Location', value: property.city || 'N/A', change: property.state || '' },
            ],
            pros: analysis.pros.slice(0, 10), // Limit to 10 pros
            cons: analysis.cons.slice(0, 8), // Limit to 8 cons
            topInsights: [
              property.address ? `Property located at ${property.address}` : 'Property analysis based on available data',
              property.listing_price && property.square_footage ? `Price per square foot: $${(property.listing_price / property.square_footage).toFixed(2)}` : 'Evaluate pricing against market comparables',
              property.bedrooms && property.bathrooms ? `${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms - consider your space needs` : 'Review property specifications',
              'Conduct thorough due diligence including inspection and title search',
            ],
            recommendations: [
              'Schedule a property viewing to assess condition and neighborhood',
              'Get a professional home inspection before making an offer',
              'Research comparable sales in the area to validate pricing',
              'Consider property taxes, insurance, and maintenance costs in your budget',
              property.city ? `Research ${property.city} market trends and future development plans` : 'Research local market conditions',
            ],
            chartData: property.listing_price ? [
              { name: 'List Price', value: property.listing_price, forecast: null },
              { name: 'Est. Market', value: property.listing_price * 0.95, forecast: null },
            ] : undefined,
            property: property,
          }
        } else {
          // Generic pros/cons when no property data available
          response.data = {
            kpis: [
              { label: 'Investment Score', value: '8.2/10', change: 'Strong' },
              { label: 'ROI Potential', value: '12.4%', change: '+2.1%' },
              { label: 'Risk Level', value: 'Moderate', change: 'Stable' },
              { label: 'Market Trend', value: 'Upward', change: '+5.3%' },
              { label: 'Location Score', value: '9.1/10', change: 'Excellent' },
            ],
            pros: [
              'Prime location with excellent connectivity and access to major highways',
              'Strong rental yield potential at 8.5% annually',
              'Growing neighborhood with new developments and infrastructure improvements',
              'High-quality school district increases property value and demand',
              'Modern amenities including pool, gym, and community spaces',
              'Low crime rate and safe neighborhood environment',
              'Potential for property value appreciation over next 5 years',
              'Good public transportation access for tenants',
            ],
            cons: [
              'Higher property taxes compared to surrounding areas',
              'Limited parking spaces may be an issue for multiple vehicles',
              'Older building may require maintenance and renovation costs',
              'HOA fees are on the higher side at $350/month',
              'Traffic congestion during peak hours in the area',
              'Limited grocery stores and shopping options within walking distance',
              'Some properties in the area showing slower appreciation rates',
              'Potential noise from nearby construction projects',
            ],
            topInsights: [
              'Overall investment score of 8.2/10 indicates strong potential',
              'Location advantages outweigh most concerns',
              'Rental income potential is above market average',
              'Consider renovation budget for older building systems',
            ],
            recommendations: [
              'Negotiate property price to account for potential renovation costs',
              'Research HOA financials and reserve funds before purchase',
              'Consider long-term rental strategy given strong yield potential',
              'Visit property during peak hours to assess traffic and noise levels',
            ],
            chartData: [
              { name: 'Year 1', value: 100, forecast: null },
              { name: 'Year 2', value: 105, forecast: null },
              { name: 'Year 3', value: 112, forecast: null },
              { name: 'Year 4', value: 118, forecast: null },
              { name: 'Year 5', value: null, forecast: 125 },
            ],
          }
        }
      } else {
        // General insights response
        response.data = {
          kpis: [
            { label: 'Portfolio Value', value: '$7.4B', change: '+12.5%' },
            { label: 'Occupancy', value: '94.2%', change: '+2.1%' },
            { label: 'Revenue', value: '$48.2M', change: '+8.3%' },
            { label: 'Expenses', value: '$32.1M', change: '-3.2%' },
            { label: 'Net Income', value: '$16.1M', change: '+15.2%' },
          ],
          topInsights: [
            'Austin Complex shows exceptional 15% growth - consider expansion',
            'Energy efficiency improvements reducing costs by 6% across portfolio',
            '3 leases expiring in Q2 require proactive management',
            'Market conditions favorable for strategic acquisitions',
            'Occupancy rates consistently above industry average of 89%',
          ],
          recommendations: [
            'Renew Dallas Tower lease before Q2 expiration - negotiate favorable terms',
            'Consider expansion in Austin market given strong performance',
            'Implement energy efficiency program across all properties',
            'Review Plano HQ lease terms 6 months before expiration',
          ],
          chartData: [
            { name: 'Q1', value: 2400, forecast: null },
            { name: 'Q2', value: 2800, forecast: null },
            { name: 'Q3', value: 3200, forecast: null },
            { name: 'Q4', value: 3500, forecast: null },
            { name: 'Q1 2025', value: null, forecast: 4100 },
            { name: 'Q2 2025', value: null, forecast: 4700 },
          ],
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
