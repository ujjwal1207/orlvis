import React from 'react'

const DentalReport = ({ submission, patient }) => {
  // Sample dental analysis data - this would come from AI analysis
  const dentalAnalysis = {
    upperTeeth: {
      annotations: [
        { type: 'inflamed', position: { x: 20, y: 30 }, color: '#800080' },
        { type: 'stains', position: { x: 60, y: 40 }, color: '#FF0000' },
        { type: 'attrition', position: { x: 80, y: 25 }, color: '#00FFFF' }
      ]
    },
    frontTeeth: {
      annotations: [
        { type: 'maligned', position: { x: 30, y: 50 }, color: '#FFFF00' },
        { type: 'stains', position: { x: 70, y: 35 }, color: '#FF0000' }
      ]
    },
    lowerTeeth: {
      annotations: [
        { type: 'receded', position: { x: 40, y: 60 }, color: '#808080' },
        { type: 'crowns', position: { x: 85, y: 45 }, color: '#FF00FF' }
      ]
    }
  }

  const treatmentRecommendations = [
    {
      condition: 'Inflammed or Red gums',
      color: '#800080',
      treatment: 'Scaling.'
    },
    {
      condition: 'Maligned',
      color: '#FFFF00',
      treatment: 'Braces or Clear Aligner'
    },
    {
      condition: 'Receded gums',
      color: '#808080',
      treatment: 'Gum Surgery.'
    },
    {
      condition: 'Stains',
      color: '#FF0000',
      treatment: 'Teeth cleaning and polishing.'
    },
    {
      condition: 'Attrition',
      color: '#00FFFF',
      treatment: 'Filling/ Night Guard.'
    },
    {
      condition: 'Crowns',
      color: '#FF00FF',
      treatment:
        'If the crown is loose or broken, better get it checked. Teeth coloured caps are the best ones.'
    }
  ]

  const formatDate = dateString => {
    if (!dateString) return new Date().toLocaleDateString()
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className='dental-report'>
      {/* Header */}
      <div className='report-header'>
        <div className='patient-info'>
          <span>
            <strong>Name:</strong>{' '}
            {patient?.fullName || submission?.patientName || 'John'}
          </span>
          <span>
            <strong>Phone:</strong> {patient?.phone || '9786111111'}
          </span>
          <span>
            <strong>Date:</strong> {formatDate(submission?.createdAt)}
          </span>
        </div>
      </div>

      {/* Screening Report Section */}
      <div className='screening-section'>
        <h2>SCREENING REPORT:</h2>

        <div className='dental-images'>
          {/* Upper Teeth */}
          <div className='dental-view'>
            <div className='image-container'>
              <img
                src={
                  submission?.originalImage?.path
                    ? `/uploads/${submission.originalImage.filename}`
                    : '/api/placeholder/250/200'
                }
                alt='Upper Teeth'
                className='dental-image'
              />
              <div className='annotations'>
                {dentalAnalysis.upperTeeth.annotations.map(
                  (annotation, index) => (
                    <div
                      key={index}
                      className='annotation-marker'
                      style={{
                        left: `${annotation.position.x}%`,
                        top: `${annotation.position.y}%`,
                        borderColor: annotation.color
                      }}
                    />
                  )
                )}
              </div>
            </div>
            <div className='view-label upper'>Upper Teeth</div>
          </div>

          {/* Front Teeth */}
          <div className='dental-view'>
            <div className='image-container'>
              <img
                src={
                  submission?.annotatedImage?.path
                    ? `/uploads/${submission.annotatedImage.filename}`
                    : submission?.originalImage?.path
                    ? `/uploads/${submission.originalImage.filename}`
                    : '/api/placeholder/250/200'
                }
                alt='Front Teeth'
                className='dental-image'
              />
              <div className='annotations'>
                {dentalAnalysis.frontTeeth.annotations.map(
                  (annotation, index) => (
                    <div
                      key={index}
                      className='annotation-marker'
                      style={{
                        left: `${annotation.position.x}%`,
                        top: `${annotation.position.y}%`,
                        borderColor: annotation.color
                      }}
                    />
                  )
                )}
              </div>
            </div>
            <div className='view-label front'>Front Teeth</div>
          </div>

          {/* Lower Teeth */}
          <div className='dental-view'>
            <div className='image-container'>
              <img
                src={
                  submission?.originalImage?.path
                    ? `/uploads/${submission.originalImage.filename}`
                    : '/api/placeholder/250/200'
                }
                alt='Lower Teeth'
                className='dental-image'
              />
              <div className='annotations'>
                {dentalAnalysis.lowerTeeth.annotations.map(
                  (annotation, index) => (
                    <div
                      key={index}
                      className='annotation-marker'
                      style={{
                        left: `${annotation.position.x}%`,
                        top: `${annotation.position.y}%`,
                        borderColor: annotation.color
                      }}
                    />
                  )
                )}
              </div>
            </div>
            <div className='view-label lower'>Lower Teeth</div>
          </div>
        </div>

        {/* Legend */}
        <div className='legend'>
          <div className='legend-item'>
            <div
              className='legend-color'
              style={{ backgroundColor: '#800080' }}
            ></div>
            <span>Inflammed / Red gums</span>
          </div>
          <div className='legend-item'>
            <div
              className='legend-color'
              style={{ backgroundColor: '#FFFF00' }}
            ></div>
            <span>Maligned</span>
          </div>
          <div className='legend-item'>
            <div
              className='legend-color'
              style={{ backgroundColor: '#808080' }}
            ></div>
            <span>Receded gums</span>
          </div>
          <div className='legend-item'>
            <div
              className='legend-color'
              style={{ backgroundColor: '#FF0000' }}
            ></div>
            <span>Stains</span>
          </div>
          <div className='legend-item'>
            <div
              className='legend-color'
              style={{ backgroundColor: '#00FFFF' }}
            ></div>
            <span>Attrition</span>
          </div>
          <div className='legend-item'>
            <div
              className='legend-color'
              style={{ backgroundColor: '#FF00FF' }}
            ></div>
            <span>Crowns</span>
          </div>
        </div>
      </div>

      {/* Treatment Recommendations */}
      <div className='treatment-section'>
        <h2>TREATMENT RECOMMENDATIONS:</h2>
        <div className='recommendations-list'>
          {treatmentRecommendations.map((recommendation, index) => (
            <div key={index} className='recommendation-item'>
              <div className='condition-indicator'>
                <div
                  className='condition-color'
                  style={{ backgroundColor: recommendation.color }}
                ></div>
                <span className='condition-name'>
                  {recommendation.condition}
                </span>
                <span className='separator'>:</span>
              </div>
              <span className='treatment-text'>{recommendation.treatment}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dental-report {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          font-family: Arial, sans-serif;
          line-height: 1.4;
        }

        .report-header {
          margin-bottom: 30px;
        }

        .patient-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #333;
        }

        .patient-info span {
          flex: 1;
        }

        .screening-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .screening-section h2 {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0 0 20px 0;
          text-align: left;
        }

        .dental-images {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .dental-view {
          flex: 1;
          text-align: center;
        }

        .image-container {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .dental-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }

        .annotations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .annotation-marker {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
        }

        .view-label {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: bold;
          display: inline-block;
        }

        .view-label.upper {
          background: #dc3545;
        }

        .view-label.front {
          background: #dc3545;
        }

        .view-label.lower {
          background: #dc3545;
        }

        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
          padding: 15px;
          background: white;
          border-radius: 6px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .treatment-section h2 {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0 0 20px 0;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.5;
        }

        .condition-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 180px;
          flex-shrink: 0;
        }

        .condition-color {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .condition-name {
          font-weight: 500;
          color: #333;
        }

        .separator {
          color: #666;
        }

        .treatment-text {
          color: #555;
          flex: 1;
        }

        @media (max-width: 768px) {
          .dental-images {
            flex-direction: column;
          }

          .patient-info {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .legend {
            justify-content: flex-start;
          }

          .condition-indicator {
            min-width: 140px;
          }
        }
      `}</style>
    </div>
  )
}

export default DentalReport
