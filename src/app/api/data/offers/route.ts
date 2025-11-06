import { NextRequest, NextResponse } from 'next/server'

const DATAXPRESS_API_KEY = process.env.DATAXPRESS_API_KEY
const DATAXPRESS_BASE_URL = process.env.DATAXPRESS_BASE_URL || 'https://www.dataxpress.shop'

// Network mappings
const NETWORKS = [
  { code: 'mtn', name: 'MTN' },
  { code: 'telecel', name: 'Telecel' },
  { code: 'tigo', name: 'Tigo' },
  { code: 'airteltigo', name: 'AirtelTigo' }
]

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching data packages from DataXpress...')

    if (!DATAXPRESS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'DataXpress API key not configured'
      })
    }

    const allOffers: any[] = []
    const errors: any[] = []

    // Fetch packages for each network
    for (const network of NETWORKS) {
      try {
        console.log(`Fetching packages for ${network.name} (${network.code})...`)
        
        const response = await fetch(`${DATAXPRESS_BASE_URL}/api/packages/${network.code}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': DATAXPRESS_API_KEY
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${network.name} packages:`, data)
          
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((pkg: any) => {
              // DataXpress uses GB as the base unit, convert to MB for consistency
              const volumeInMB = (pkg.volume || pkg.volumeInMB || 0) * 1000
              allOffers.push({
                network: network.name,
                networkCode: network.code,
                volume: volumeInMB,
                volumeGB: `${pkg.volume || pkg.volumeInMB || 0}GB`,
                cost: pkg.cost || pkg.price || 0,
                currency: 'GHS',
                available: true,
                packageId: pkg.id || pkg.packageId,
                validity: pkg.validity || '30 days',
                description: pkg.description || `${pkg.volume || pkg.volumeInMB || 0}GB ${network.name} data bundle`
              })
            })
          } else if (data.packages && Array.isArray(data.packages)) {
            data.packages.forEach((pkg: any) => {
              // DataXpress uses GB as the base unit, convert to MB for consistency
              const volumeInMB = (pkg.volume || pkg.volumeInMB || 0) * 1000
              allOffers.push({
                network: network.name,
                networkCode: network.code,
                volume: volumeInMB,
                volumeGB: `${pkg.volume || pkg.volumeInMB || 0}GB`,
                cost: pkg.cost || pkg.price || 0,
                currency: 'GHS',
                available: true,
                packageId: pkg.id || pkg.packageId,
                validity: pkg.validity || '30 days',
                description: pkg.description || `${pkg.volume || pkg.volumeInMB || 0}GB ${network.name} data bundle`
              })
            })
          }
        } else {
          const errorText = await response.text()
          errors.push({
            network: network.name,
            error: `${response.status}: ${errorText}`,
            available: false
          })
          console.log(`❌ ${network.name} packages: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        errors.push({
          network: network.name,
          error: error.message,
          available: false
        })
        console.log(`❌ ${network.name} packages error:`, error.message)
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // If packages API doesn't work, fall back to testing common volumes
    if (allOffers.length === 0) {
      console.log('Packages API returned no data, falling back to cost-price testing...')
      
      const TEST_VOLUMES = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000, 25000, 30000, 40000, 50000]
      
      for (const network of NETWORKS) {
        console.log(`Testing ${network.name} volumes...`)
        
        for (const volume of TEST_VOLUMES) {
          try {
            const response = await fetch(`${DATAXPRESS_BASE_URL}/api/get-cost-price`, {
              method: 'POST',
              headers: {
                'X-API-KEY': DATAXPRESS_API_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                volumeInMB: volume,
                networkType: network.code
              })
            })

            if (response.ok) {
              const data = await response.json()
              if (data.data?.cost && data.data.cost > 0) {
                allOffers.push({
                  network: network.name,
                  networkCode: network.code,
                  volume: volume,
                  volumeGB: (volume / 1000).toFixed(1) + 'GB',
                  cost: data.data.cost,
                  currency: 'GHS',
                  available: true,
                  description: `${(volume / 1000)}GB ${network.name} data bundle`
                })
                console.log(`✅ ${network.name} ${volume}MB: ₵${data.data.cost}`)
              }
            }
          } catch (error) {
            console.log(`❌ ${network.name} ${volume}MB: ${error.message}`)
          }

          // Add small delay
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }

    // Group offers by network
    const offersByNetwork = allOffers.reduce((acc, offer) => {
      if (!acc[offer.network]) {
        acc[offer.network] = []
      }
      acc[offer.network].push(offer)
      return acc
    }, {} as any)

    // Sort by volume
    Object.keys(offersByNetwork).forEach(network => {
      offersByNetwork[network].sort((a: any, b: any) => a.volume - b.volume)
    })

    return NextResponse.json({
      success: true,
      data: {
        offers: offersByNetwork,
        totalOffers: allOffers.length,
        errors: errors.slice(0, 10), // Show first 10 errors
        summary: {
          networks: Object.keys(offersByNetwork),
          totalBundles: allOffers.length,
          averagePrice: allOffers.length > 0 ? 
            (allOffers.reduce((sum, offer) => sum + offer.cost, 0) / allOffers.length).toFixed(2) : 0
        },
        apiInfo: {
          method: allOffers.length > 0 ? 'packages' : 'cost-price',
          networksTested: NETWORKS.map(n => n.name),
          timestamp: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error fetching data offers:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data offers',
      details: error.message
    })
  }
}
