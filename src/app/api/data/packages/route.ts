import { NextRequest, NextResponse } from 'next/server'

const DATAXPRESS_API_KEY = process.env.DATAXPRESS_API_KEY
const DATAXPRESS_BASE_URL = process.env.DATAXPRESS_BASE_URL || 'https://www.dataxpress.shop'

// Network mappings for frontend
const NETWORKS = [
  { code: 'mtn', name: 'MTN', logo: '/mtn.jpg' },
  { code: 'telecel', name: 'Telecel', logo: '/telecel.png' },
  { code: 'airteltigo', name: 'AirtelTigo', logo: '/at.png' }
]

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching data packages for buy-data page...')

    if (!DATAXPRESS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'DataXpress API key not configured'
      })
    }

    const networkData: any[] = []

    // Fetch packages for each network
    for (const network of NETWORKS) {
      try {
        console.log(`Fetching packages for ${network.name}...`)
        
        const response = await fetch(`${DATAXPRESS_BASE_URL}/api/packages/${network.code}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': DATAXPRESS_API_KEY
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${network.name} packages loaded`)
          
          const packages: any[] = []
          
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((pkg: any) => {
              // DataXpress uses GB as the base unit, convert to MB for consistency
              const volumeInMB = (pkg.volume || pkg.volumeInMB || 0) * 1000
              packages.push({
                id: pkg.id || pkg.packageId,
                volume: volumeInMB,
                volumeGB: `${pkg.volume || pkg.volumeInMB || 0}GB`,
                cost: pkg.cost || pkg.price || 0,
                validity: pkg.validity || '30 days',
                description: pkg.description || `${pkg.volume || pkg.volumeInMB || 0}GB ${network.name} data bundle`
              })
            })
          } else if (data.packages && Array.isArray(data.packages)) {
            data.packages.forEach((pkg: any) => {
              // DataXpress uses GB as the base unit, convert to MB for consistency
              const volumeInMB = (pkg.volume || pkg.volumeInMB || 0) * 1000
              packages.push({
                id: pkg.id || pkg.packageId,
                volume: volumeInMB,
                volumeGB: `${pkg.volume || pkg.volumeInMB || 0}GB`,
                cost: pkg.cost || pkg.price || 0,
                validity: pkg.validity || '30 days',
                description: pkg.description || `${pkg.volume || pkg.volumeInMB || 0}GB ${network.name} data bundle`
              })
            })
          }

          // Sort packages by volume
          packages.sort((a, b) => a.volume - b.volume)

          networkData.push({
            code: network.code,
            name: network.name,
            logo: network.logo,
            packages: packages
          })
        } else {
          console.log(`❌ ${network.name} packages failed: ${response.status}`)
          // Add empty network data to maintain structure
          networkData.push({
            code: network.code,
            name: network.name,
            logo: network.logo,
            packages: []
          })
        }
      } catch (error) {
        console.log(`❌ ${network.name} packages error:`, error.message)
        // Add empty network data to maintain structure
        networkData.push({
          code: network.code,
          name: network.name,
          logo: network.logo,
          packages: []
        })
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      success: true,
      data: {
        networks: networkData,
        totalPackages: networkData.reduce((sum, network) => sum + network.packages.length, 0),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching data packages:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data packages',
      details: error.message
    })
  }
}
