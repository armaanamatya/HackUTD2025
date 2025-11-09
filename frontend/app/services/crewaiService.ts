// Service for interacting with the CrewAI FastAPI backend
const CREWAI_API_BASE = process.env.NEXT_PUBLIC_CREWAI_API_URL || 'http://localhost:8000'

// Logging utility
const log = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[FRONTEND-CREWAI] ${timestamp} | INFO | ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString()
    console.error(`[FRONTEND-CREWAI] ${timestamp} | ERROR | ${message}`, error || '')
  },
  request: (method: string, url: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[FRONTEND-CREWAI] ${timestamp} | REQUEST | ${method} ${url}`, data ? { payload: data } : '')
  },
  response: (method: string, url: string, status: number, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[FRONTEND-CREWAI] ${timestamp} | RESPONSE | ${method} ${url} | Status: ${status}`, data || '')
  }
}

export interface ResearchRequest {
  topic: string
}

export interface ProjectPlanningRequest {
  project_description: string
}

export interface ResearchWithFilesRequest {
  topic: string
  files: FileContext[]
}

export interface ProjectPlanningWithFilesRequest {
  project_description: string
  files: FileContext[]
}

export interface FileContext {
  fileName: string
  content: string
  fileType: string
  extractedText?: string
  metrics?: any
  clauses?: any
}

export interface JobResponse {
  job_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  result: string | null
  error: string | null
}

class CrewAIService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${CREWAI_API_BASE}${endpoint}`
    const method = options.method || 'GET'
    const startTime = performance.now()
    
    // Log request
    let requestData = null
    if (options.body) {
      try {
        requestData = JSON.parse(options.body as string)
      } catch {
        requestData = { body: 'Binary or non-JSON data' }
      }
    }
    log.request(method, endpoint, requestData)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      const duration = performance.now() - startTime
      const responseData = await response.json()
      
      // Log response
      log.response(method, endpoint, response.status, { 
        duration: `${duration.toFixed(2)}ms`,
        dataSize: JSON.stringify(responseData).length + ' chars'
      })
      
      if (!response.ok) {
        log.error(`API Error: ${response.status} ${response.statusText}`, responseData)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      return responseData
    } catch (error) {
      const duration = performance.now() - startTime
      log.error(`Request failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }

  async getConfig() {
    return this.makeRequest('/config')
  }

  async startResearchJob(topic: string): Promise<JobResponse> {
    log.info('Starting research job', { topic: topic.substring(0, 100) + '...' })
    return this.makeRequest<JobResponse>('/research', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    })
  }

  async startProjectPlanningJob(projectDescription: string): Promise<JobResponse> {
    log.info('Starting project planning job', { projectDescription: projectDescription.substring(0, 100) + '...' })
    return this.makeRequest<JobResponse>('/project-planning', {
      method: 'POST',
      body: JSON.stringify({ project_description: projectDescription }),
    })
  }

  async startResearchJobWithFiles(topic: string, files: FileContext[]): Promise<JobResponse> {
    log.info('Starting research job with files', { 
      topic: topic.substring(0, 100) + '...', 
      fileCount: files.length,
      fileNames: files.map(f => f.fileName)
    })
    return this.makeRequest<JobResponse>('/research-with-files', {
      method: 'POST',
      body: JSON.stringify({ topic, files }),
    })
  }

  async startProjectPlanningJobWithFiles(projectDescription: string, files: FileContext[]): Promise<JobResponse> {
    log.info('Starting project planning job with files', { 
      projectDescription: projectDescription.substring(0, 100) + '...', 
      fileCount: files.length,
      fileNames: files.map(f => f.fileName)
    })
    return this.makeRequest<JobResponse>('/project-planning-with-files', {
      method: 'POST',
      body: JSON.stringify({ project_description: projectDescription, files }),
    })
  }

  // Helper function to convert uploaded files to file context
  async processUploadedFiles(uploadedFiles: any[]): Promise<FileContext[]> {
    log.info('Starting file processing', { 
      fileCount: uploadedFiles.length,
      files: uploadedFiles.map(f => ({ name: f.file.name, size: f.file.size, type: f.file.type }))
    })
    
    const fileContexts: FileContext[] = []
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const uploadedFile = uploadedFiles[i]
      const startTime = performance.now()
      
      log.info(`Processing file ${i + 1}/${uploadedFiles.length}`, {
        fileName: uploadedFile.file.name,
        fileSize: uploadedFile.file.size,
        fileType: uploadedFile.file.type
      })
      
      const formData = new FormData()
      formData.append('file', uploadedFile.file)
      
      try {
        // Use the existing document processing endpoint
        const response = await fetch('/api/document', {
          method: 'POST',
          body: formData,
        })
        
        const duration = performance.now() - startTime
        
        if (response.ok) {
          const result = await response.json()
          log.info(`File processed successfully`, {
            fileName: uploadedFile.file.name,
            duration: `${duration.toFixed(2)}ms`,
            extractedTextLength: result.aiSummary?.length || 0,
            hasMetrics: !!result.metrics,
            hasClauses: !!result.clauses
          })
          
          fileContexts.push({
            fileName: uploadedFile.file.name,
            content: result.aiSummary || 'File processed successfully',
            fileType: uploadedFile.file.type,
            extractedText: result.aiSummary,
            metrics: result.metrics,
            clauses: result.clauses
          })
        } else {
          log.error(`File processing failed`, {
            fileName: uploadedFile.file.name,
            duration: `${duration.toFixed(2)}ms`,
            status: response.status,
            statusText: response.statusText
          })
          
          // Fallback if processing fails
          fileContexts.push({
            fileName: uploadedFile.file.name,
            content: `File: ${uploadedFile.file.name} (${uploadedFile.file.type})`,
            fileType: uploadedFile.file.type
          })
        }
      } catch (error) {
        const duration = performance.now() - startTime
        log.error(`File processing error`, {
          fileName: uploadedFile.file.name,
          duration: `${duration.toFixed(2)}ms`,
          error: error
        })
        
        // Still add the file to context even if processing fails
        fileContexts.push({
          fileName: uploadedFile.file.name,
          content: `File: ${uploadedFile.file.name} (${uploadedFile.file.type}) - Processing failed`,
          fileType: uploadedFile.file.type
        })
      }
    }
    
    log.info('File processing complete', {
      totalFiles: uploadedFiles.length,
      successfulFiles: fileContexts.filter(f => !f.content.includes('Processing failed')).length,
      failedFiles: fileContexts.filter(f => f.content.includes('Processing failed')).length
    })
    
    return fileContexts
  }

  async getJobStatus(jobId: string): Promise<JobResponse> {
    // Only log occasionally to avoid spam during polling
    if (Math.random() < 0.1) { // Log ~10% of status checks
      log.info('Checking job status', { jobId })
    }
    return this.makeRequest<JobResponse>(`/jobs/${jobId}`)
  }

  async listJobs() {
    return this.makeRequest('/jobs')
  }

  async deleteJob(jobId: string) {
    return this.makeRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
    })
  }

  // Helper method to poll job status until completion
  async pollJobCompletion(
    jobId: string, 
    onStatusUpdate?: (status: JobResponse) => void,
    maxAttempts: number = 60, // 5 minutes with 5-second intervals
    intervalMs: number = 5000
  ): Promise<JobResponse> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const jobStatus = await this.getJobStatus(jobId)
          
          if (onStatusUpdate) {
            onStatusUpdate(jobStatus)
          }

          if (jobStatus.status === 'completed') {
            resolve(jobStatus)
          } else if (jobStatus.status === 'failed') {
            reject(new Error(jobStatus.error || 'Job failed'))
          } else {
            // Job is still pending or running
            attempts++
            if (attempts >= maxAttempts) {
              reject(new Error('Job polling timeout'))
            } else {
              setTimeout(checkStatus, intervalMs)
            }
          }
        } catch (error) {
          reject(error)
        }
      }

      checkStatus()
    })
  }

  // Determine job type based on query content
  determineJobType(query: string): 'research' | 'project-planning' {
    const planningKeywords = ['project', 'plan', 'planning', 'build', 'create', 'develop', 'implement', 'design', 'architecture', 'requirements']
    const lowercaseQuery = query.toLowerCase()
    
    const hasPlanningKeywords = planningKeywords.some(keyword => 
      lowercaseQuery.includes(keyword)
    )
    
    return hasPlanningKeywords ? 'project-planning' : 'research'
  }

  // Unified method to start appropriate job based on query
  async startJob(query: string, uploadedFiles?: any[]): Promise<JobResponse> {
    const jobType = this.determineJobType(query)
    const hasFiles = uploadedFiles && uploadedFiles.length > 0
    
    log.info('Starting unified job', {
      jobType,
      hasFiles,
      fileCount: hasFiles ? uploadedFiles!.length : 0,
      queryLength: query.length
    })
    
    if (hasFiles) {
      // Process files first
      const fileContexts = await this.processUploadedFiles(uploadedFiles!)
      
      if (jobType === 'project-planning') {
        return this.startProjectPlanningJobWithFiles(query, fileContexts)
      } else {
        return this.startResearchJobWithFiles(query, fileContexts)
      }
    } else {
      // No files, use regular endpoints
      if (jobType === 'project-planning') {
        return this.startProjectPlanningJob(query)
      } else {
        return this.startResearchJob(query)
      }
    }
  }
}

export const crewaiService = new CrewAIService()
export default crewaiService