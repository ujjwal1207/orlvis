const PDFDocument = require('pdfkit')
const fs = require('fs').promises
const path = require('path')
const { getFileUrl } = require('../middleware/upload')

class PDFReportGenerator {
  constructor () {
    this.pageWidth = 612 // 8.5" * 72 DPI
    this.pageHeight = 792 // 11" * 72 DPI
    this.margin = 50
    this.contentWidth = this.pageWidth - this.margin * 2
  }

  async generateReport (submission, options = {}) {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: this.margin,
          bottom: this.margin,
          left: this.margin,
          right: this.margin
        }
      })

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `report-${submission.patientId}-${timestamp}.pdf`
      const outputPath = path.join(__dirname, '../../reports', filename)

      // Create write stream
      const stream = require('fs').createWriteStream(outputPath)
      doc.pipe(stream)

      // Add content to PDF
      await this.addHeader(doc)
      await this.addPatientInfo(doc, submission)
      await this.addImages(doc, submission)
      await this.addAnnotationDetails(doc, submission)
      await this.addNotes(doc, submission)
      await this.addFooter(doc, submission)

      // Finalize PDF
      doc.end()

      // Wait for stream to finish
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve)
        stream.on('error', reject)
      })

      return {
        filename,
        path: outputPath,
        url: getFileUrl(filename, 'reports')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error('Failed to generate PDF report')
    }
  }

  async addHeader (doc) {
    // Add logo area (placeholder)
    doc
      .fontSize(24)
      .fillColor('#2c5aa0')
      .text('OralVis Healthcare', this.margin, this.margin)

    doc
      .fontSize(16)
      .fillColor('#666666')
      .text('Dental Analysis Report', this.margin, this.margin + 35)

    // Add horizontal line
    doc
      .moveTo(this.margin, this.margin + 65)
      .lineTo(this.pageWidth - this.margin, this.margin + 65)
      .strokeColor('#cccccc')
      .stroke()

    // Move cursor down
    doc.y = this.margin + 80
  }

  async addPatientInfo (doc, submission) {
    const startY = doc.y

    doc
      .fontSize(18)
      .fillColor('#333333')
      .text('Patient Information', this.margin, startY)

    doc.y += 20

    const infoItems = [
      ['Patient Name:', submission.patientName],
      ['Patient ID:', submission.patientId],
      ['Email:', submission.patientEmail],
      [
        'Submission Date:',
        new Date(submission.submittedAt).toLocaleDateString()
      ],
      ['Report Generated:', new Date().toLocaleDateString()],
      [
        'Status:',
        submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
      ]
    ]

    doc.fontSize(12).fillColor('#333333')

    infoItems.forEach(([label, value]) => {
      doc
        .font('Helvetica-Bold')
        .text(label, this.margin, doc.y, { continued: true, width: 150 })
      doc
        .font('Helvetica')
        .text(` ${value}`, { width: this.contentWidth - 150 })
      doc.y += 18
    })

    doc.y += 20
  }

  async addImages (doc, submission) {
    const startY = doc.y

    doc.fontSize(18).fillColor('#333333').text('Images', this.margin, startY)

    doc.y += 20

    try {
      // Calculate image dimensions (fit within content area)
      const maxImageWidth = (this.contentWidth - 20) / 2
      const maxImageHeight = 200

      // Add original image
      if (submission.originalImage && submission.originalImage.path) {
        doc
          .fontSize(14)
          .fillColor('#666666')
          .text('Original Image:', this.margin, doc.y)

        doc.y += 15

        const originalImageExists = await fs
          .access(submission.originalImage.path)
          .then(() => true)
          .catch(() => false)

        if (originalImageExists) {
          doc.image(submission.originalImage.path, this.margin, doc.y, {
            fit: [maxImageWidth, maxImageHeight],
            align: 'left'
          })
        } else {
          doc
            .fontSize(10)
            .fillColor('#999999')
            .text('Original image not available', this.margin, doc.y)
        }
      }

      // Add annotated image if available
      if (submission.annotatedImage && submission.annotatedImage.path) {
        const annotatedImageExists = await fs
          .access(submission.annotatedImage.path)
          .then(() => true)
          .catch(() => false)

        if (annotatedImageExists) {
          doc
            .fontSize(14)
            .fillColor('#666666')
            .text(
              'Annotated Image:',
              this.margin + maxImageWidth + 20,
              startY + 20
            )

          doc.image(
            submission.annotatedImage.path,
            this.margin + maxImageWidth + 20,
            startY + 35,
            {
              fit: [maxImageWidth, maxImageHeight],
              align: 'left'
            }
          )
        }
      }

      // Move cursor below images
      doc.y = Math.max(doc.y, startY + maxImageHeight + 60)
    } catch (error) {
      console.error('Error adding images to PDF:', error)
      doc
        .fontSize(10)
        .fillColor('#999999')
        .text('Images could not be loaded', this.margin, doc.y)
      doc.y += 20
    }
  }

  async addAnnotationDetails (doc, submission) {
    if (!submission.annotatedImage || !submission.annotatedImage.annotations) {
      return
    }

    const startY = doc.y

    doc
      .fontSize(18)
      .fillColor('#333333')
      .text('Annotation Details', this.margin, startY)

    doc.y += 20

    const annotations = submission.annotatedImage.annotations

    if (annotations.shapes && annotations.shapes.length > 0) {
      doc.fontSize(12).fillColor('#333333')

      annotations.shapes.forEach((shape, index) => {
        const annotationText = this.getAnnotationDescription(shape, index + 1)
        doc.text(annotationText, this.margin, doc.y, {
          width: this.contentWidth
        })
        doc.y += 15
      })
    } else {
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('No specific annotations recorded.', this.margin, doc.y)
    }

    doc.y += 20
  }

  getAnnotationDescription (shape, index) {
    const type = shape.type || 'unknown'
    const color = shape.color || 'red'

    switch (type) {
      case 'rectangle':
        return `${index}. Rectangle annotation (${color}) - Area marked for examination`
      case 'circle':
        return `${index}. Circle annotation (${color}) - Circular area of interest`
      case 'arrow':
        return `${index}. Arrow annotation (${color}) - Pointing to specific location`
      case 'freehand':
        return `${index}. Freehand annotation (${color}) - Custom marking`
      case 'text':
        return `${index}. Text annotation: "${shape.text || 'Text note'}"`
      default:
        return `${index}. Annotation (${color}) - ${type}`
    }
  }

  async addNotes (doc, submission) {
    const startY = doc.y

    doc
      .fontSize(18)
      .fillColor('#333333')
      .text('Notes and Observations', this.margin, startY)

    doc.y += 20

    // Patient notes
    if (submission.patientNotes && submission.patientNotes.trim()) {
      doc
        .fontSize(14)
        .fillColor('#666666')
        .text('Patient Notes:', this.margin, doc.y)

      doc.y += 15

      doc
        .fontSize(12)
        .fillColor('#333333')
        .text(submission.patientNotes, this.margin, doc.y, {
          width: this.contentWidth,
          align: 'left'
        })

      doc.y += 25
    }

    // Admin notes
    if (submission.adminNotes && submission.adminNotes.trim()) {
      doc
        .fontSize(14)
        .fillColor('#666666')
        .text('Professional Notes:', this.margin, doc.y)

      doc.y += 15

      doc
        .fontSize(12)
        .fillColor('#333333')
        .text(submission.adminNotes, this.margin, doc.y, {
          width: this.contentWidth,
          align: 'left'
        })

      doc.y += 25
    }

    // Recommendations section
    doc
      .fontSize(14)
      .fillColor('#666666')
      .text('Recommendations:', this.margin, doc.y)

    doc.y += 15

    doc
      .fontSize(12)
      .fillColor('#333333')
      .text(
        'Please consult with your dental healthcare provider for professional diagnosis and treatment recommendations based on this analysis.',
        this.margin,
        doc.y,
        {
          width: this.contentWidth,
          align: 'left'
        }
      )

    doc.y += 30
  }

  async addFooter (doc, submission) {
    const footerY = this.pageHeight - this.margin - 60

    // Move to footer area
    doc.y = footerY

    // Add horizontal line
    doc
      .moveTo(this.margin, footerY)
      .lineTo(this.pageWidth - this.margin, footerY)
      .strokeColor('#cccccc')
      .stroke()

    doc.y += 10

    // Footer text
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(
        'This report was generated by OralVis Healthcare System',
        this.margin,
        doc.y
      )

    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      this.margin,
      doc.y + 12
    )

    if (submission.reviewedBy) {
      doc.text(`Reviewed by: Healthcare Professional`, this.margin, doc.y + 24)
    }

    // Add page number
    doc.text(`Page 1`, this.pageWidth - this.margin - 50, footerY + 10)

    // Disclaimer
    doc.y += 40
    doc
      .fontSize(8)
      .fillColor('#999999')
      .text(
        'Disclaimer: This report is for informational purposes only and should not replace professional medical advice. ' +
          'Please consult with a qualified healthcare provider for proper diagnosis and treatment.',
        this.margin,
        doc.y,
        {
          width: this.contentWidth,
          align: 'center'
        }
      )
  }
}

module.exports = PDFReportGenerator
