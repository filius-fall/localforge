import { useState } from 'react'
import { faker } from '@faker-js/faker'

interface FakeProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  company: string
  jobTitle: string
}

function DataGenerator() {
  const [data, setData] = useState<FakeProfile[]>([])
  const [count, setCount] = useState<number>(5)
  const [error, setError] = useState<string>('')

  const generateData = () => {
    try {
      setError('')
      const newData: FakeProfile[] = Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
        company: faker.company.name(),
        jobTitle: faker.person.jobTitle(),
      }))
      setData(newData)
    } catch {
      setError('Failed to generate data')
    }
  }

  const copyToClipboard = async (item: FakeProfile) => {
    try {
      const text = Object.entries(item)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const copyAllToClipboard = async () => {
    try {
      const text = data
        .map((item, index) => `--- Profile ${index + 1} ---\n${Object.entries(item)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}`)
        .join('\n\n')
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const clearData = () => {
    setData([])
    setError('')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Data Generator</h1>
        <p className="tool-subtitle">
          Generate fake profiles, addresses, and company data
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <div className="form-group">
            <label htmlFor="count">Number of Records</label>
            <input
              id="count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="input"
            />
          </div>
          <div className="button-row">
            <button
              className="button primary"
              type="button"
              onClick={generateData}
            >
              Generate Data
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={clearData}
              disabled={data.length === 0}
            >
              Clear
            </button>
          </div>
        </div>

        {data.length > 0 && (
          <>
            <div className="tool-section">
              <div className="data-list">
                {data.map((item, index) => (
                  <div key={item.id} className="data-item">
                    <div className="data-item-header">
                      <h3>Profile {index + 1}</h3>
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => copyToClipboard(item)}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                    <div className="data-item-content">
                      <div className="data-row">
                        <span className="data-label">Name:</span>
                        <span className="data-value">{item.name}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Email:</span>
                        <span className="data-value">{item.email}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Phone:</span>
                        <span className="data-value">{item.phone}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Address:</span>
                        <span className="data-value">{item.address}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">City, State, Zip:</span>
                        <span className="data-value">
                          {item.city}, {item.state} {item.zip}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Country:</span>
                        <span className="data-value">{item.country}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Company:</span>
                        <span className="data-value">{item.company}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Job Title:</span>
                        <span className="data-value">{item.jobTitle}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tool-section">
              <button
                className="button primary"
                type="button"
                onClick={copyAllToClipboard}
              >
                Copy All to Clipboard
              </button>
            </div>
          </>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default DataGenerator
