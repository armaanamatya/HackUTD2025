import { NextRequest, NextResponse } from 'next/server'

export type IntentType = 'property_discovery' | 'predictive_analytics' | 'smart_search' | 'document_intelligence' | 'insight_summarizer'

// Enhanced intent classification
function classifyIntent(query: string): IntentType {
  const lowerQuery = query.toLowerCase()
  
  // Property discovery - highest priority for property-related queries
  if (
    lowerQuery.includes('house') || 
    lowerQuery.includes('property') || 
    lowerQuery.includes('properties') ||
    lowerQuery.includes('buy') ||
    lowerQuery.includes('purchase') ||
    lowerQuery.includes('listing') ||
    lowerQuery.includes('listings') ||
    lowerQuery.includes('home') ||
    lowerQuery.includes('homes') ||
    lowerQuery.includes('real estate') ||
    lowerQuery.includes('search property') ||
    lowerQuery.includes('find property') ||
    lowerQuery.includes('show me property') ||
    lowerQuery.includes('zillow') ||
    lowerQuery.includes('airbnb')
  ) {
    return 'property_discovery'
  }
  
  // Predictive analytics
  if (
    lowerQuery.includes('forecast') ||
    lowerQuery.includes('predict') ||
    lowerQuery.includes('prediction') ||
    lowerQuery.includes('trend') ||
    lowerQuery.includes('trends') ||
    lowerQuery.includes('growth') ||
    lowerQuery.includes('performance') ||
    lowerQuery.includes('analytics') ||
    lowerQuery.includes('analyze') ||
    lowerQuery.includes('chart') ||
    lowerQuery.includes('graph') ||
    lowerQuery.includes('visualize') ||
    lowerQuery.includes('metric') ||
    lowerQuery.includes('kpi')
  ) {
    return 'predictive_analytics'
  }
  
  // Document intelligence
  if (
    lowerQuery.includes('document') ||
    lowerQuery.includes('contract') ||
    lowerQuery.includes('lease') ||
    lowerQuery.includes('agreement') ||
    lowerQuery.includes('clause') ||
    lowerQuery.includes('clauses') ||
    lowerQuery.includes('extract') ||
    lowerQuery.includes('upload') ||
    lowerQuery.includes('report') ||
    lowerQuery.includes('pdf')
  ) {
    return 'document_intelligence'
  }
  
  // Insight summarizer
  if (
    lowerQuery.includes('insight') ||
    lowerQuery.includes('insights') ||
    lowerQuery.includes('summarize') ||
    lowerQuery.includes('summary') ||
    lowerQuery.includes('overview') ||
    lowerQuery.includes('dashboard') ||
    lowerQuery.includes('combine') ||
    lowerQuery.includes('consolidate') ||
    lowerQuery.includes('all data')
  ) {
    return 'insight_summarizer'
  }
  
  // Default to smart search for conversational queries
  return 'smart_search'
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
      response.title = 'Property Discovery'
      response.content = `Found ${12} properties matching your search criteria.`
      response.data = {
        properties: [
          {
            id: 1,
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop',
            title: 'Dream House Reality',
            address: 'Evergreen 14 Jakarta, Indonesia',
            price: '$367.00/month',
            rating: 4.9,
            type: 'Home',
            beds: 4,
            baths: 3,
            sqft: '3,200',
            year: 2020,
            tags: ['Garden', 'Garage'],
          },
          {
            id: 2,
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
            title: 'Atap Langit Homes',
            address: 'Business Park Jakarta, Indonesia',
            price: '$278.00/month',
            rating: 4.7,
            type: 'Apartment',
            beds: 2,
            baths: 2,
            sqft: '1,800',
            year: 2021,
            tags: ['Gym', 'Pool'],
          },
          {
            id: 3,
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
            title: 'Midnight Ridge Villa',
            address: '440 Thamrin Jakarta, Indonesia',
            price: '$452.00/month',
            rating: 4.8,
            type: 'Villa',
            beds: 6,
            baths: 4,
            sqft: '4,500',
            year: 2022,
            tags: ['Garden', 'Garage', 'Pool'],
          },
          {
            id: 4,
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
            title: 'Unity Urban Homes',
            address: 'Commerce Drive Jakarta, Indonesia',
            price: '$325.00/month',
            rating: 4.6,
            type: 'Home',
            beds: 3,
            baths: 2,
            sqft: '2,600',
            year: 2019,
            tags: ['Garden'],
          },
          {
            id: 5,
            image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop',
            title: 'Lalaland Thick Villa',
            address: 'Innovation Blvd Jakarta, Indonesia',
            price: '$512.00/month',
            rating: 4.9,
            type: 'Villa',
            beds: 5,
            baths: 4,
            sqft: '4,200',
            year: 2023,
            tags: ['Garden', 'Garage', 'Gym'],
          },
          {
            id: 6,
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop',
            title: 'Modern Skyline Condo',
            address: 'Financial District Jakarta, Indonesia',
            price: '$289.00/month',
            rating: 4.5,
            type: 'Condo',
            beds: 2,
            baths: 1,
            sqft: '1,500',
            year: 2021,
            tags: ['Gym', 'Pool'],
          },
        ],
        filters: {
          locations: ['Jakarta, Indonesia', 'Semarang, Indonesia'],
          priceRange: { min: 0, max: 5000 },
          propertyTypes: ['Home', 'Apartment', 'Villa', 'Condo'],
          amenities: ['Garden', 'Gym', 'Garage', 'Pool'],
        },
      }
    }
    // Predictive Analytics Response
    else if (intent === 'predictive_analytics') {
      response.title = 'Predictive Analytics'
      response.content = 'Forecasting portfolio performance and market trends.'
      response.data = {
        metrics: [
          { label: 'Total Value', value: '$2.4B', change: '+12.5%', trend: 'up' },
          { label: 'Occupancy Rate', value: '94.2%', change: '+2.1%', trend: 'up' },
          { label: 'Expenses', value: '$48.2M', change: '-3.2%', trend: 'down' },
          { label: 'ROI', value: '18.5%', change: '+4.2%', trend: 'up' },
          { label: 'Revenue Growth', value: '15.3%', change: '+5.1%', trend: 'up' },
        ],
        chartData: [
          { name: 'Jan', value: 2400, forecast: null },
          { name: 'Feb', value: 2800, forecast: null },
          { name: 'Mar', value: 3200, forecast: null },
          { name: 'Apr', value: 3500, forecast: null },
          { name: 'May', value: 3800, forecast: null },
          { name: 'Jun', value: null, forecast: 4100 },
          { name: 'Jul', value: null, forecast: 4400 },
          { name: 'Aug', value: null, forecast: 4700 },
          { name: 'Sep', value: null, forecast: 5000 },
        ],
        chartType: 'line',
        insights: [
          'Strong upward trend projected for next quarter',
          'Occupancy rates expected to exceed 95%',
          'Cost efficiency improvements continuing',
        ],
      }
    }
    // Smart Search Response
    else if (intent === 'smart_search') {
      response.title = 'Smart Search'
      const lowerQuery = query.toLowerCase()
      
      if (lowerQuery.includes('lease') && lowerQuery.includes('expir')) {
        response.content = 'I found 3 leases expiring in Q2 2024:\n\n• Dallas Tower Lease - Expires June 30, 2025\n  Monthly Rent: $38,000\n  Status: Renewal option available\n\n• Plano HQ Lease - Expires March 15, 2026\n  Monthly Rent: $45,000\n  Status: Active, no immediate action needed\n\n• Austin Complex Lease - Expires September 30, 2024\n  Monthly Rent: $52,000\n  Status: Requires attention - expiring soon\n\nWould you like me to analyze renewal options or search for replacement properties?'
      } else if (lowerQuery.includes('energy') || lowerQuery.includes('cost')) {
        response.content = 'Energy cost analysis across your portfolio:\n\n• Total Energy Costs: $2.4M annually\n• Change from last quarter: -3.2% (improving)\n• Average cost per sqft: $0.85\n\nBreakdown by property:\n• Dallas Tower: $0.72/sqft (most efficient)\n• Plano HQ: $0.91/sqft (needs improvement)\n• Austin Complex: $0.78/sqft (good)\n\nRecommendation: Consider HVAC upgrades at Plano HQ to match Dallas Tower efficiency. Potential savings: $180K annually.'
      } else {
        response.content = `I understand you're asking about "${query}". As your AI real estate analyst, I can help you:\n\n• Search and discover properties\n• Analyze trends and make predictions\n• Extract insights from documents\n• Provide comprehensive summaries\n\nWhat would you like to explore?`
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
      response.title = 'Insight Summary Dashboard'
      response.content = 'Comprehensive overview combining insights from multiple data sources.'
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

    return NextResponse.json(response)
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
