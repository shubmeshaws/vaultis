'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Download,
    FileJson,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'

import { useDatabase } from '@/contexts/DatabaseContext'
import { InputModal } from '@/components/ui/InputModal'

interface Column {
    key: string
    label: string
    width?: number
}

interface QueryResultsTableProps {
    columns: Column[]
    data: any[]
    totalRows?: number
    executionTime?: string
    sql?: string
}

export function QueryResultsTable({
    columns,
    data,
    totalRows = data.length,
    executionTime = '0ms',
    sql = ''
}: QueryResultsTableProps) {
    const { selectedDb } = useDatabase()
    const { toast } = useToast()
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 10

    const totalPages = Math.ceil(totalRows / rowsPerPage)

    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel' | null>(null)
    const [pendingFilename, setPendingFilename] = useState('')

    const startRow = (currentPage - 1) * rowsPerPage + 1
    const endRow = Math.min(currentPage * rowsPerPage, totalRows)
    const handleCopy = () => {
        if (!data || data.length === 0) {
            toast({ title: 'No data to copy', type: 'warning' })
            return
        }

        // Format as Markdown Table
        const headerRow = `| ${columns.map(c => c.label).join(' | ')} |`
        const separatorRow = `| ${columns.map(() => '---').join(' | ')} |`
        const dataRows = data.map(row =>
            `| ${columns.map(col => {
                const val = row[col.key]
                return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')
            }).join(' | ')} |`
        ).join('\n')

        const tableText = `${headerRow}\n${separatorRow}\n${dataRows}`

        navigator.clipboard.writeText(tableText).then(() => {
            toast({ title: 'Copied to clipboard', description: `${totalRows} rows copied in table format`, type: 'success' })
        }).catch(err => {
            toast({ title: 'Failed to copy', description: err.message, type: 'error' })
        })
    }

    const handleExportRequest = (format: 'csv' | 'json' | 'excel') => {
        if (!data || data.length === 0) {
            toast({ title: 'No data to export', type: 'warning' })
            return
        }

        // Extract table name from SQL
        const tableMatch = sql.match(/FROM\s+([a-zA-Z0-9_".]+)/i)
        const tableName = tableMatch ? tableMatch[1].replace(/["']/g, '') : 'results'
        const dbName = selectedDb?.name?.replace(/\s+/g, '_') || 'database'

        // Date in IST
        const now = new Date()
        const istOffset = 5.5 * 60 * 60 * 1000
        const istDate = new Date(now.getTime() + istOffset)
        const dateStr = istDate.toISOString().split('T')[0]
        const timeStr = istDate.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')

        const defaultFilename = `${dbName}_${tableName}_${dateStr}_${timeStr}_IST`

        setPendingFilename(defaultFilename)
        setExportFormat(format)
        setIsExportModalOpen(true)
    }

    const handleConfirmExport = (customFilename: string) => {
        if (!exportFormat) return

        let content = ''
        let filename = customFilename || pendingFilename
        let mimeType = 'text/plain'

        if (exportFormat === 'json') {
            content = JSON.stringify(data, null, 2)
            filename += '.json'
            mimeType = 'application/json'
        } else {
            const headers = columns.map(c => c.label).join(',')
            const rows = data.map(row =>
                columns.map(col => {
                    const val = row[col.key]
                    if (val === null || val === undefined) return ''
                    const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
                    return `"${str.replace(/"/g, '""')}"`
                }).join(',')
            ).join('\n')
            content = `${headers}\n${rows}`
            filename += exportFormat === 'csv' ? '.csv' : '.xlsx'
            mimeType = 'text/csv'
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({ title: 'Export successful', description: `Data saved as ${exportFormat.toUpperCase()}`, type: 'success' })
        setIsExportModalOpen(false)
    }

    return (
        <div className="relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-xl border border-foreground/30 shadow-sm">
            {/* Header Bar */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Query Results</span>
                    <div className="h-3 w-px bg-white/20" />
                    <span className="text-[10px] font-mono text-muted-foreground">{executionTime} • {totalRows} rows</span>
                </div>

                {/* Export Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleExportRequest('csv')}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors group relative"
                        title="Export as CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-background px-2 py-1 rounded shadow-lg">CSV</span>
                    </button>
                    <button
                        onClick={() => handleExportRequest('json')}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors group relative"
                        title="Export as JSON"
                    >
                        <FileJson className="w-3.5 h-3.5" />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-background px-2 py-1 rounded shadow-lg">JSON</span>
                    </button>
                    <button
                        onClick={() => handleExportRequest('excel')}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors group relative"
                        title="Export as Excel"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-background px-2 py-1 rounded shadow-lg">XLSX</span>
                    </button>
                    <div className="h-4 w-px bg-foreground/10 mx-1" />
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        title="Copy to clipboard"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                    {/* Sticky Header */}
                    <thead className="sticky top-0 z-10 bg-foreground/[0.08] backdrop-blur-xl border-b border-foreground/10">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground group cursor-col-resize select-none"
                                    style={{ width: col.width }}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-0.5 h-4 bg-foreground/20 rounded-full" />
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-foreground/5">
                        {data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row, rowIndex) => (
                            <motion.tr
                                key={rowIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: rowIndex * 0.02 }}
                                className="hover:bg-foreground/[0.02] transition-colors group"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={`${rowIndex}-${col.key}`}
                                        className="px-4 py-3 text-foreground/90"
                                    >
                                        {typeof row[col.key] === 'object' ? (
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {JSON.stringify(row[col.key])}
                                            </span>
                                        ) : (
                                            <span className={cn(
                                                col.key === 'id' && "font-mono text-xs opacity-70",
                                                col.key === 'email' && "text-muted-foreground"
                                            )}>
                                                {row[col.key]}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-foreground/5 flex items-center justify-between bg-foreground/[0.02]">
                <div className="text-xs text-muted-foreground font-normal">
                    Showing <span className="font-bold text-foreground">{startRow}</span> to <span className="font-bold text-foreground">{endRow}</span> of <span className="font-bold text-foreground">{totalRows}</span> results
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (currentPage <= 3) {
                                pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={cn(
                                        "min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all",
                                        currentPage === pageNum
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>

            <InputModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={handleConfirmExport}
                title="Export Results"
                description={`Enter a filename for your ${exportFormat?.toUpperCase()} export.`}
                placeholder="filename"
                defaultValue={pendingFilename}
                confirmText="Download"
            />
        </div>
    )
}
