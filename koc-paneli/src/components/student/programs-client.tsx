'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, X, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/coach/format'
import type { StudentProgram } from '@/lib/student/types'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Setup pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ProgramsClientProps = {
  programs: StudentProgram[]
}

export function ProgramsClient({ programs }: ProgramsClientProps) {
  const [selectedProgram, setSelectedProgram] = useState<StudentProgram | null>(null)
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [, setLoadingPdf] = useState(true)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
    setLoadingPdf(false)
  }

  function handleOpenModal(program: StudentProgram) {
    setSelectedProgram(program)
    setPageNumber(1)
    setLoadingPdf(true)
  }

  function handleCloseModal() {
    setSelectedProgram(null)
    setNumPages(undefined)
    setPageNumber(1)
  }

  if (programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Henüz program yüklenmedi</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Koçunuz yakında antrenman veya beslenme programınızı buraya yükleyecek.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <Card key={p.id} className="surface-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{p.title}</p>
                      {p.isNew && (
                        <Badge className="bg-primary/20 px-1.5 py-0 text-[10px] text-primary">
                          Yeni
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              </div>

              {p.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handleOpenModal(p)}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Görüntüle
                </Button>
                <a href={p.fileUrl} download={p.fileName} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    İndir
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PDF Preview Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-muted/30 shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/60 p-4 sm:p-6">
              <div>
                <h3 className="font-bold text-foreground">{selectedProgram.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProgram.fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={selectedProgram.fileUrl} download={selectedProgram.fileName} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" className="hidden bg-muted text-foreground hover:bg-muted sm:flex">
                    <Download className="mr-2 h-4 w-4" />
                    İndir
                  </Button>
                </a>
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer Area */}
            <div className="flex flex-1 items-start justify-center overflow-auto bg-black/20 p-4 sm:p-6">
              <Document
                file={selectedProgram.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center justify-center py-20 text-primary">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin" />
                    <p>PDF Yükleniyor...</p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center py-20 text-red-400 text-center">
                    <p className="font-medium mb-2">PDF yüklenirken bir hata oluştu.</p>
                    <p className="text-sm opacity-80">Lütfen doğrudan indirerek görüntülemeyi deneyin.</p>
                  </div>
                }
                className="flex w-full justify-center shadow-lg"
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="max-w-full"
                  width={window.innerWidth < 640 ? window.innerWidth - 64 : undefined}
                />
              </Document>
            </div>

            {/* Modal Footer / Pagination */}
            {numPages && (
              <div className="flex shrink-0 items-center justify-between border-t border-border/60 p-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                    disabled={pageNumber <= 1}
                    className="h-8 w-8 rounded-lg border-border/60 bg-muted text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="min-w-[80px] text-center text-sm font-medium text-foreground">
                    {pageNumber} / {numPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                    disabled={pageNumber >= numPages}
                    className="h-8 w-8 rounded-lg border-border/60 bg-muted text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <a href={selectedProgram.fileUrl} download={selectedProgram.fileName} target="_blank" rel="noopener noreferrer" className="sm:hidden">
                  <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:bg-muted">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    İndir
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
