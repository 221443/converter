import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatBytes, showError, hideError, setLoading } from '../utils.js'

// Mock DOM elements for testing
const mockDOM = () => {
  const mockElement = {
    style: { display: 'none' },
    textContent: '',
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  }
  
  global.document = {
    getElementById: vi.fn(() => mockElement)
  }
  
  return mockElement
}

describe('Utils Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('should handle decimal places correctly', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB')
      expect(formatBytes(1536, 0)).toBe('2 KB')
    })
  })

  describe('showError', () => {
    it('should display error message', () => {
      const mockElement = mockDOM()
      const context = { errorEl: mockElement }
      
      showError('Test error message', context)
      
      expect(mockElement.textContent).toBe('Test error message')
      expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden')
    })
  })

  describe('hideError', () => {
    it('should hide error message', () => {
      const mockElement = mockDOM()
      const context = { errorEl: mockElement }
      
      hideError(context)
      
      expect(mockElement.classList.add).toHaveBeenCalledWith('hidden')
    })
  })

  describe('setLoading', () => {
    it('should set loading state correctly', () => {
      const mockButton = mockDOM()
      const mockText = mockDOM()
      const context = { 
        convertBtn: mockButton,
        convertBtnText: mockText
      }
      
      setLoading(true, context, 'Converting...')
      
      expect(mockButton.disabled).toBe(true)
      expect(mockText.textContent).toBe('Converting...')
    })

    it('should unset loading state correctly', () => {
      const mockButton = mockDOM()
      const mockText = mockDOM()
      const context = { 
        convertBtn: mockButton,
        convertBtnText: mockText
      }
      
      setLoading(false, context)
      
      expect(mockButton.disabled).toBe(false)
      expect(mockText.textContent).toBe('Convert Files')
    })
  })
})