import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminAPI } from '../utils/api'
import {
  Save,
  Download,
  Undo,
  Redo,
  Square,
  Circle,
  ArrowRight,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

const ImageAnnotation = () => {
  const { submissionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Canvas state
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('rectangle') // rectangle, circle, arrow, freehand
  const [color, setColor] = useState('#ff0000')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [annotations, setAnnotations] = useState([])
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const [currentAnnotation, setCurrentAnnotation] = useState(null)
  const [showAnnotations, setShowAnnotations] = useState(true)

  // Image dimensions and scale
  const [scale, setScale] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  const colors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#ffffff',
    '#000000',
    '#ffa500',
    '#800080',
    '#008000',
    '#000080'
  ]

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin')
      return
    }
    fetchSubmission()
  }, [submissionId, user, navigate])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSubmission(submissionId)
      
      if (!response?.data?.submission) {
        throw new Error('Invalid submission data received')
      }
      
      setSubmission(response.data.submission)

      // Load existing annotations if any
      if (response.data.submission.annotatedImage?.annotations) {
        setAnnotations(response.data.submission.annotatedImage.annotations)
        setHistory([response.data.submission.annotatedImage.annotations])
        setHistoryStep(0)
      }
    } catch (error) {
      console.error('Error fetching submission:', error)
      toast.error('Failed to load submission')
      navigate('/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleImageLoad = () => {
    const img = imageRef.current
    const canvas = canvasRef.current

    if (img && canvas) {
      const containerWidth = canvas.parentElement.clientWidth - 40 // Account for padding
      const containerHeight = 600 // Max height

      const imageAspectRatio = img.naturalWidth / img.naturalHeight
      const containerAspectRatio = containerWidth / containerHeight

      let displayWidth, displayHeight

      if (imageAspectRatio > containerAspectRatio) {
        displayWidth = containerWidth
        displayHeight = containerWidth / imageAspectRatio
      } else {
        displayHeight = containerHeight
        displayWidth = containerHeight * imageAspectRatio
      }

      canvas.width = displayWidth
      canvas.height = displayHeight

      setScale(displayWidth / img.naturalWidth)
      setImageLoaded(true)

      redrawCanvas()
    }
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current

    if (!canvas || !ctx || !img || !imageLoaded) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Draw annotations if visible
    if (showAnnotations) {
      annotations.forEach(annotation => {
        drawAnnotation(ctx, annotation)
      })
    }
  }

  const drawAnnotation = (ctx, annotation) => {
    ctx.strokeStyle = annotation.color
    ctx.lineWidth = annotation.strokeWidth * scale
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    switch (annotation.type) {
      case 'rectangle':
        ctx.strokeRect(
          annotation.x * scale,
          annotation.y * scale,
          annotation.width * scale,
          annotation.height * scale
        )
        break

      case 'circle':
        const radius =
          Math.sqrt(
            Math.pow(annotation.width * scale, 2) +
              Math.pow(annotation.height * scale, 2)
          ) / 2
        ctx.beginPath()
        ctx.arc(
          (annotation.x + annotation.width / 2) * scale,
          (annotation.y + annotation.height / 2) * scale,
          radius,
          0,
          2 * Math.PI
        )
        ctx.stroke()
        break

      case 'arrow':
        drawArrow(ctx, annotation)
        break

      case 'freehand':
        if (annotation.points && annotation.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(
            annotation.points[0].x * scale,
            annotation.points[0].y * scale
          )
          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(
              annotation.points[i].x * scale,
              annotation.points[i].y * scale
            )
          }
          ctx.stroke()
        }
        break
    }
  }

  const drawArrow = (ctx, annotation) => {
    const startX = annotation.x * scale
    const startY = annotation.y * scale
    const endX = (annotation.x + annotation.width) * scale
    const endY = (annotation.y + annotation.height) * scale

    // Draw line
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Draw arrowhead
    const angle = Math.atan2(endY - startY, endX - startX)
    const arrowLength = 15
    const arrowAngle = Math.PI / 6

    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle)
    )
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle)
    )
    ctx.stroke()
  }

  const getCanvasCoordinates = e => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    }
  }

  const handleMouseDown = e => {
    if (!imageLoaded) return

    const coords = getCanvasCoordinates(e)
    setIsDrawing(true)

    if (tool === 'freehand') {
      setCurrentAnnotation({
        type: 'freehand',
        color,
        strokeWidth,
        points: [coords]
      })
    } else {
      setCurrentAnnotation({
        type: tool,
        color,
        strokeWidth,
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0
      })
    }
  }

  const handleMouseMove = e => {
    if (!isDrawing || !currentAnnotation || !imageLoaded) return

    const coords = getCanvasCoordinates(e)

    if (tool === 'freehand') {
      setCurrentAnnotation(prev => ({
        ...prev,
        points: [...prev.points, coords]
      }))
    } else {
      setCurrentAnnotation(prev => ({
        ...prev,
        width: coords.x - prev.x,
        height: coords.y - prev.y
      }))
    }

    // Redraw with current annotation
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      redrawCanvas()
      drawAnnotation(ctx, currentAnnotation)
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return

    setIsDrawing(false)

    // Add to annotations
    const newAnnotations = [...annotations, currentAnnotation]
    setAnnotations(newAnnotations)

    // Update history
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newAnnotations)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)

    setCurrentAnnotation(null)
    redrawCanvas()
  }

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1)
      setAnnotations(history[historyStep - 1])
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1)
      setAnnotations(history[historyStep + 1])
    }
  }

  const clearAnnotations = () => {
    const newAnnotations = []
    setAnnotations(newAnnotations)

    const newHistory = [...history, newAnnotations]
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)

    redrawCanvas()
  }

  const saveAnnotations = async () => {
    try {
      setSaving(true)

      // Convert canvas to blob
      const canvas = canvasRef.current
      canvas.toBlob(async blob => {
        const formData = new FormData()
        formData.append('annotatedImage', blob, 'annotated_image.png')
        formData.append('annotations', JSON.stringify(annotations))

        await adminAPI.saveAnnotations(submissionId, formData)
        toast.success('Annotations saved successfully')
      }, 'image/png')
    } catch (error) {
      console.error('Error saving annotations:', error)
      toast.error('Failed to save annotations')
    } finally {
      setSaving(false)
    }
  }

  const generateReport = async () => {
    try {
      setGenerating(true)
      await adminAPI.generateReport(submissionId)
      toast.success('Report generated successfully')

      // Update submission status
      await adminAPI.updateSubmissionStatus(submissionId, {
        status: 'completed'
      })

      // Redirect back to admin dashboard
      navigate('/admin')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    redrawCanvas()
  }, [annotations, showAnnotations, imageLoaded])

  if (loading) {
    return (
      <div className='annotation-page'>
        <div className='container'>
          <div className='loading-state'>
            <div className='spinner'></div>
            <p>Loading submission...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className='annotation-page'>
        <div className='container'>
          <div className='error-state'>
            <h2>Submission not found</h2>
            <button
              onClick={() => navigate('/admin')}
              className='btn btn-primary'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='annotation-page'>
      <div className='container-fluid'>
        {/* Header */}
        <div className='annotation-header'>
          <div className='header-left'>
            <button
              onClick={() => navigate('/admin')}
              className='btn btn-secondary btn-sm'
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <div className='submission-info'>
              <h2>Annotate Image</h2>
              <p>
                Patient: {submission.user.name} | ID:{' '}
                {submission._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className='header-actions'>
            <button
              onClick={saveAnnotations}
              disabled={saving || annotations.length === 0}
              className='btn btn-primary'
            >
              {saving ? (
                <>
                  <div className='spinner-sm'></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Annotations
                </>
              )}
            </button>

            <button
              onClick={generateReport}
              disabled={generating || annotations.length === 0}
              className='btn btn-success'
            >
              {generating ? (
                <>
                  <div className='spinner-sm'></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        <div className='annotation-workspace'>
          {/* Toolbar */}
          <div className='toolbar'>
            <div className='tool-section'>
              <h4>Tools</h4>
              <div className='tool-buttons'>
                <button
                  className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`}
                  onClick={() => setTool('rectangle')}
                  title='Rectangle'
                >
                  <Square size={18} />
                </button>
                <button
                  className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
                  onClick={() => setTool('circle')}
                  title='Circle'
                >
                  <Circle size={18} />
                </button>
                <button
                  className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`}
                  onClick={() => setTool('arrow')}
                  title='Arrow'
                >
                  <ArrowRight size={18} />
                </button>
                <button
                  className={`tool-btn ${tool === 'freehand' ? 'active' : ''}`}
                  onClick={() => setTool('freehand')}
                  title='Freehand'
                >
                  <Edit3 size={18} />
                </button>
              </div>
            </div>

            <div className='tool-section'>
              <h4>Color</h4>
              <div className='color-picker'>
                {colors.map(c => (
                  <button
                    key={c}
                    className={`color-btn ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className='tool-section'>
              <h4>Stroke Width</h4>
              <div className='stroke-controls'>
                <button
                  onClick={() => setStrokeWidth(Math.max(1, strokeWidth - 1))}
                  className='stroke-btn'
                >
                  <Minus size={14} />
                </button>
                <span className='stroke-value'>{strokeWidth}px</span>
                <button
                  onClick={() => setStrokeWidth(Math.min(10, strokeWidth + 1))}
                  className='stroke-btn'
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className='tool-section'>
              <h4>Actions</h4>
              <div className='action-buttons'>
                <button
                  onClick={undo}
                  disabled={historyStep <= 0}
                  className='action-btn'
                  title='Undo'
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyStep >= history.length - 1}
                  className='action-btn'
                  title='Redo'
                >
                  <Redo size={16} />
                </button>
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className='action-btn'
                  title={
                    showAnnotations ? 'Hide Annotations' : 'Show Annotations'
                  }
                >
                  {showAnnotations ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={clearAnnotations}
                  disabled={annotations.length === 0}
                  className='action-btn danger'
                  title='Clear All'
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className='canvas-container'>
            <div className='canvas-wrapper'>
              <img
                ref={imageRef}
                src={`/api/uploads/${submission.imagePath}`}
                alt='Dental X-ray'
                style={{ display: 'none' }}
                onLoad={handleImageLoad}
                crossOrigin='anonymous'
              />
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsDrawing(false)}
                style={{
                  cursor: tool === 'freehand' ? 'crosshair' : 'default',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          </div>

          {/* Patient Notes */}
          {submission.patientNotes && (
            <div className='patient-notes'>
              <h4>Patient Notes</h4>
              <p>{submission.patientNotes}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .annotation-page {
          padding: 0;
          min-height: 100vh;
        }

        .annotation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .submission-info h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .submission-info p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .annotation-workspace {
          display: flex;
          height: calc(100vh - 80px);
        }

        .toolbar {
          width: 280px;
          background-color: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .tool-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tool-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .tool-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tool-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .tool-btn.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .color-picker {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .color-btn {
          width: 32px;
          height: 32px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.active {
          border-color: var(--text-primary);
          transform: scale(1.1);
          box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--text-primary);
        }

        .stroke-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stroke-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stroke-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .stroke-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          min-width: 36px;
          text-align: center;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover:not(:disabled) {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.danger:hover:not(:disabled) {
          border-color: var(--error-color);
          color: var(--error-color);
        }

        .canvas-container {
          flex: 1;
          padding: 2rem;
          background-color: var(--bg-tertiary);
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .canvas-wrapper {
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 1rem;
          max-width: 100%;
          max-height: 100%;
        }

        .patient-notes {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          width: 300px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .patient-notes h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .patient-notes p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .annotation-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .header-left {
            width: 100%;
            justify-content: space-between;
          }

          .header-actions {
            width: 100%;
            justify-content: stretch;
          }

          .header-actions .btn {
            flex: 1;
          }

          .annotation-workspace {
            flex-direction: column;
            height: auto;
          }

          .toolbar {
            width: 100%;
            max-height: 300px;
            flex-direction: row;
            overflow-x: auto;
            padding: 1rem;
          }

          .tool-section {
            min-width: 200px;
          }

          .canvas-container {
            padding: 1rem;
          }

          .patient-notes {
            position: static;
            width: 100%;
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ImageAnnotation
