{{/*
============================================================================
  VAULTIS HELM — Template Helpers
============================================================================
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "vaultis.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fully qualified app name (release + chart, truncated to 63 chars).
*/}}
{{- define "vaultis.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Chart label value.
*/}}
{{- define "vaultis.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to every resource.
*/}}
{{- define "vaultis.labels" -}}
helm.sh/chart: {{ include "vaultis.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: vaultis
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
{{- end }}

{{/* ---- Application component ---- */}}

{{- define "vaultis.app.fullname" -}}
{{- printf "%s-app" (include "vaultis.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "vaultis.app.labels" -}}
{{ include "vaultis.labels" . }}
{{ include "vaultis.app.selectorLabels" . }}
{{- end }}

{{- define "vaultis.app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "vaultis.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: app
{{- end }}

{{/* ---- PostgreSQL component ---- */}}

{{- define "vaultis.pg.fullname" -}}
{{- printf "%s-postgresql" (include "vaultis.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "vaultis.pg.labels" -}}
{{ include "vaultis.labels" . }}
{{ include "vaultis.pg.selectorLabels" . }}
{{- end }}

{{- define "vaultis.pg.selectorLabels" -}}
app.kubernetes.io/name: {{ include "vaultis.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: postgresql
{{- end }}

{{/*
Name of the ServiceAccount to use.
*/}}
{{- define "vaultis.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "vaultis.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
PostgreSQL Secret name — either user-provided or chart-managed.
*/}}
{{- define "vaultis.pg.secretName" -}}
{{- if .Values.postgresql.auth.existingSecret }}
{{- .Values.postgresql.auth.existingSecret }}
{{- else }}
{{- include "vaultis.pg.fullname" . }}
{{- end }}
{{- end }}

{{/*
Construct the DATABASE_URL from postgresql values.
*/}}
{{- define "vaultis.databaseUrl" -}}
{{- printf "postgresql://%s:$(POSTGRES_PASSWORD)@%s:%v/%s?schema=public" .Values.postgresql.auth.username (include "vaultis.pg.fullname" .) (.Values.postgresql.service.port | int) .Values.postgresql.auth.database }}
{{- end }}
