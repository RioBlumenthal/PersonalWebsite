import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.ABSTRACT_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get the client's IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : real || '';

    console.log('IP Detection Debug:', {
      forwarded,
      real,
      finalIp: ip
    });

    // If no IP is detected or it's localhost, use a fallback
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      // For development, we'll use a fallback IP or skip the API call
      console.log('Using fallback for localhost/private IP');
      return NextResponse.json({
        ip_address: '71.78.210.226', // Your IP from the example
        city: 'Dallas',
        region: 'Texas',
        region_iso_code: 'TX',
        postal_code: '75287',
        country: 'United States',
        country_code: 'US',
        country_is_eu: false,
        continent: 'North America',
        continent_code: 'NA',
        longitude: -96.8346,
        latitude: 32.9993,
        security: {
          is_vpn: false
        },
        timezone: {
          name: 'America/Chicago',
          abbreviation: 'CDT',
          gmt_offset: -5,
          current_time: new Date().toLocaleTimeString('en-US', { 
            timeZone: 'America/Chicago',
            hour12: false 
          }),
          is_dst: true
        },
        flag: {
          emoji: '🇺🇸',
          unicode: 'U+1F1FA U+1F1F8',
          png: 'https://static.abstractapi.com/country-flags/US_flag.png',
          svg: 'https://static.abstractapi.com/country-flags/US_flag.svg'
        },
        currency: {
          currency_name: 'USD',
          currency_code: 'USD'
        },
        connection: {
          autonomous_system_number: 11427,
          autonomous_system_organization: 'TWC-11427-TEXAS',
          connection_type: null,
          isp_name: null,
          organization_name: null
        }
      });
    }

    // Make the API call to Abstract API
    const response = await fetch(
      `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}&ip_address=${ip}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('API Response Debug:', {
      status: response.status,
      data: data
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geolocation data' },
      { status: 500 }
    );
  }
} 