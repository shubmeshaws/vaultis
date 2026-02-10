'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    Clock,
    HardDrive,
    Trash2,
    ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DownloadItem {
    id: string
    fileName: string
    fileType: 'csv' | 'json' | 'excel'
    size: string
    createdAt: string
    queryPreview?: string
}

interface DownloadHistoryPanelProps {
    downloads: DownloadItem[]
    onDownload?: (id: string) => void
    onDelete?: (id: string) => void
}

export function DownloadHistoryPanel({
    downloads,
    onDownload,
    onDelete
}: DownloadHistoryPanelProps) {

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'csv': return FileText
            case 'json': return FileJson
            case 'excel': return FileSpreadsheet
            default: return FileText
        }
    }

    const getFileColor = (type: string) => {
        switch (type) {
            case 'csv': return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            case 'json': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
            case 'excel': return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20'
            default: return 'text-muted-foreground bg-foreground/[0.03] dark:bg-white/5 border-foreground/10 dark:border-white/10'
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Download History</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {downloads.length} export{downloads.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>

            {/* Download Items */}
            <div className="space-y-3">
                {downloads.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                        <Download className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-normal text-muted-foreground">No exports yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Run a query and export results to see them here
                        </p>
                    </div>
                ) : (
                    downloads.map((item, index) => {
                        const FileIcon = getFileIcon(item.fileType)
                        const colorClass = getFileColor(item.fileType)

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative p-3 rounded-xl bg-background dark:bg-card/50 backdrop-blur-xl border border-foreground/10 dark:border-white/10 hover:border-primary/30 transition-all hover:shadow-lg shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    {/* File Icon */}
                                    <div className={cn(
                                        "p-3 rounded-lg border transition-all",
                                        colorClass
                                    )}>
                                        <FileIcon className="w-5 h-5" />
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-foreground truncate">
                                                    {item.fileName}
                                                </h4>
                                                {item.queryPreview && (
                                                    <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                                                        {item.queryPreview}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide whitespace-nowrap",
                                                item.fileType === 'csv' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                                item.fileType === 'json' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                                item.fileType === 'excel' && "bg-green-500/10 text-green-600 dark:text-green-400"
                                            )}>
                                                {item.fileType}
                                            </span>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <HardDrive className="w-3 h-3" />
                                                <span className="font-mono">{item.size}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                <span>{item.createdAt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                if (onDownload) {
                                                    onDownload(item.id)
                                                } else {
                                                    console.log('Download:', item.id, item.fileName)
                                                }
                                            }}
                                            className="p-2 rounded-lg hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onDelete) {
                                                    onDelete(item.id)
                                                } else {
                                                    console.log('Delete:', item.id, item.fileName)
                                                }
                                            }}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subtle Gradient Overlay */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-transparent to-foreground/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
