import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('id') || 'Unknown Bill';
    const title = searchParams.get('title') || 'Canadian Federal Bill';
    const status = searchParams.get('status') || 'Unknown';
    const judgment = searchParams.get('judgment') || 'neutral';
    const chamber = searchParams.get('chamber') || '';

    // Determine colors based on judgment
    const getJudgmentColor = (judgment: string) => {
      switch (judgment) {
        case 'yes':
          return { bg: '#22c55e', text: 'SUPPORTS' };
        case 'no':
          return { bg: '#ef4444', text: 'OPPOSES' };
        default:
          return { bg: '#6b7280', text: 'NEUTRAL' };
      }
    };

    const judgmentStyle = getJudgmentColor(judgment);

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Build Canada Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                background: '#932f2f',
                padding: '16px',
                borderRadius: '8px',
                marginRight: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
              }}
            >
              <div
                style={{
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                BC
              </div>
            </div>
            <div
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              Build Canada Policy Tracker
            </div>
          </div>

          {/* Bill Information */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              maxWidth: '900px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Bill ID */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              {billId}
            </div>

            {/* Bill Title */}
            <div
              style={{
                fontSize: '24px',
                color: '#374151',
                marginBottom: '32px',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              {title.length > 80 ? title.substring(0, 80) + '...' : title}
            </div>

            {/* Status and Chamber */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  background: '#f3f4f6',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  color: '#6b7280',
                }}
              >
                Status: {status}
              </div>
              {chamber && (
                <div
                  style={{
                    background: '#f3f4f6',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    color: '#6b7280',
                  }}
                >
                  {chamber}
                </div>
              )}
            </div>

            {/* Build Canada Judgment */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  color: '#374151',
                  fontWeight: '600',
                }}
              >
                Build Canada
              </div>
              <div
                style={{
                  background: judgmentStyle.bg,
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '24px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                {judgmentStyle.text}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#374151',
                  fontWeight: '600',
                }}
              >
                this bill
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              color: '#9ca3af',
              fontSize: '16px',
              marginTop: '32px',
            }}
          >
            buildcanada.ca/bills/{billId.toLowerCase()}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

