import { useState, useEffect, useRef } from 'react'
import { getDiseaseCrops, detectDisease } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

export default function DiseaseDetection() {
  const { t } = useLanguage()
  const [crops, setCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    getDiseaseCrops()
      .then(data => {
        setCrops(data.crops || [])
        if (data.crops?.length > 0) setSelectedCrop(data.crops[0].key)
      })
      .catch(() => setCrops([
        { key: 'potato', name: 'Potato', available: true },
        { key: 'corn', name: 'Corn / Maize', available: true },
        { key: 'rice', name: 'Rice', available: true },
        { key: 'sugarcane', name: 'Sugarcane', available: true },
      ]))
  }, [])

  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Max size: 10MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDetect = async () => {
    if (!selectedCrop) { setError('Please select a crop'); return }
    if (!imageFile) { setError('Please upload a leaf image'); return }

    setLoading(true)
    setError(null)
    try {
      const data = await detectDisease(selectedCrop, imageFile)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
  }

  const cropIcons = { potato: '🥔', corn: '🌽', rice: '🌾', sugarcane: '🎋' }

  return (
    <div className="animate-fade-in">
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 'var(--sp-6)' }}>
        {/* Input Section */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>🔬 Disease Detection</h3>
              <span className="badge badge-green">AI Powered</span>
            </div>
            <div className="card-body">
              {/* Crop Selection */}
              <div className="form-group">
                <label className="form-label">Select Crop</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
                  {crops.map(crop => (
                    <button
                      key={crop.key}
                      onClick={() => { setSelectedCrop(crop.key); setResult(null) }}
                      style={{
                        padding: 'var(--sp-4)',
                        borderRadius: 'var(--radius-lg)',
                        border: selectedCrop === crop.key
                          ? '2px solid var(--green-500)'
                          : '2px solid var(--border-color)',
                        background: selectedCrop === crop.key
                          ? 'var(--green-50)'
                          : 'var(--bg-primary)',
                        cursor: crop.available ? 'pointer' : 'not-allowed',
                        opacity: crop.available ? 1 : 0.5,
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      disabled={!crop.available}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: 'var(--sp-1)' }}>
                        {cropIcons[crop.key] || '🌿'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{crop.name}</div>
                      {!crop.available && (
                        <div className="text-xs text-muted">Model not loaded</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group" style={{ marginTop: 'var(--sp-5)' }}>
                <label className="form-label">Upload Leaf Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--green-500)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: imagePreview ? 'var(--sp-2)' : 'var(--sp-8)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'var(--green-50)' : 'var(--bg-secondary)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {imagePreview ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="Leaf preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '250px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'contain',
                        }}
                      />
                      <div className="text-sm text-muted" style={{ marginTop: 'var(--sp-2)' }}>
                        {imageFile?.name} ({(imageFile?.size / 1024).toFixed(0)} KB)
                      </div>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginTop: 'var(--sp-2)' }}
                        onClick={(e) => { e.stopPropagation(); handleReset() }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)', opacity: 0.6 }}>📷</div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-1)' }}>
                        Drop image here or click to browse
                      </p>
                      <p className="text-sm text-muted">JPG, PNG — Max 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 'var(--sp-4)' }}
                onClick={handleDetect}
                disabled={loading || !imageFile || !selectedCrop}
              >
                {loading ? '🔄 Analyzing...' : '🔬 Detect Disease'}
              </button>
            </div>
          </div>

          {/* Supported diseases info */}
          {selectedCrop && crops.length > 0 && (
            <div className="card" style={{ marginTop: 'var(--sp-4)' }}>
              <div className="card-header">
                <h4>ℹ️ Detectable Diseases</h4>
              </div>
              <div className="card-body">
                {crops.find(c => c.key === selectedCrop)?.diseases?.map((d, i) => (
                  <div key={i} style={{
                    padding: 'var(--sp-2) 0',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {d.includes('Healthy') ? '✅' : '🦠'} {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div>
          {error && (
            <div className="card animate-fade-in" style={{ borderColor: 'var(--danger)', marginBottom: 'var(--sp-4)' }}>
              <div className="card-body" style={{ color: 'var(--danger)' }}>
                ❌ {error}
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Analyzing leaf image with AI model...</span>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">🔬</div>
              <h3>Upload a Leaf Image</h3>
              <p className="text-secondary">
                Select your crop, upload a photo of the affected leaf, and our AI will detect the disease and suggest treatment.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in-up">
              {/* Main Result */}
              <div className="card" style={{
                borderColor: result.is_healthy ? 'var(--green-500)' : '#F57C00',
                borderWidth: '2px',
                marginBottom: 'var(--sp-4)',
              }}>
                <div className="card-header">
                  <h3>{result.is_healthy ? '✅ Healthy Plant' : '🦠 Disease Detected'}</h3>
                  <span className="badge" style={{
                    background: result.is_healthy ? 'var(--green-100)' : '#FFF3E0',
                    color: result.is_healthy ? 'var(--green-700)' : '#E65100',
                  }}>
                    {result.confidence}% confidence
                  </span>
                </div>
                <div className="card-body">
                  <div style={{
                    display: 'flex', gap: 'var(--sp-4)', alignItems: 'center',
                    marginBottom: 'var(--sp-4)',
                  }}>
                    <div style={{
                      fontSize: '3rem',
                      width: 70, height: 70,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 'var(--radius-lg)',
                      background: result.is_healthy ? 'var(--green-50)' : '#FFF3E0',
                    }}>
                      {result.is_healthy ? '🌿' : '🦠'}
                    </div>
                    <div>
                      <h2 style={{ marginBottom: 'var(--sp-1)' }}>{result.disease}</h2>
                      <p className="text-sm text-muted">Crop: {result.crop}</p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="score-bar-container" style={{ marginBottom: 'var(--sp-4)' }}>
                    <div className="score-bar" style={{
                      width: `${result.confidence}%`,
                      background: result.is_healthy
                        ? 'linear-gradient(90deg, var(--green-400), var(--green-600))'
                        : 'linear-gradient(90deg, #FF9800, #F57C00)',
                    }}></div>
                  </div>
                </div>
              </div>

              {/* Treatment */}
              <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
                <div className="card-header">
                  <h3>💊 Treatment Recommendation</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                    <div style={{
                      background: '#E8F5E9',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--sp-4)',
                    }}>
                      <div className="text-xs text-muted" style={{ marginBottom: 'var(--sp-1)' }}>🧴 Spray / Medicine</div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{result.treatment.spray}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                      <div style={{
                        background: '#FFF8E1',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--sp-4)',
                      }}>
                        <div className="text-xs text-muted" style={{ marginBottom: 'var(--sp-1)' }}>💧 Dosage</div>
                        <div style={{ fontWeight: 600 }}>{result.treatment.dosage}</div>
                      </div>
                      <div style={{
                        background: '#E3F2FD',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--sp-4)',
                      }}>
                        <div className="text-xs text-muted" style={{ marginBottom: 'var(--sp-1)' }}>📅 Interval</div>
                        <div style={{ fontWeight: 600 }}>{result.treatment.interval}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Predictions */}
              {result.all_predictions && (
                <div className="card">
                  <div className="card-header">
                    <h4>📊 All Predictions</h4>
                  </div>
                  <div className="card-body">
                    {result.all_predictions.map((pred, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                        padding: 'var(--sp-3) 0',
                        borderBottom: i < result.all_predictions.length - 1 ? '1px solid var(--border-color)' : 'none',
                      }}>
                        <div style={{ flex: 1, fontSize: '0.85rem' }}>
                          {pred.disease.includes('Healthy') ? '✅' : '🦠'} {pred.disease}
                        </div>
                        <div style={{ width: 120 }}>
                          <div className="score-bar-container" style={{ height: 8 }}>
                            <div className="score-bar" style={{
                              width: `${pred.confidence}%`,
                              background: pred.confidence > 50
                                ? 'var(--green-500)'
                                : 'var(--gray-400)',
                            }}></div>
                          </div>
                        </div>
                        <div style={{ width: 50, textAlign: 'right', fontSize: '0.8rem', fontWeight: 600 }}>
                          {pred.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
