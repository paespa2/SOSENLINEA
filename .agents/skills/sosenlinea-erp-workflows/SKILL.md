---
name: sosenlinea-erp-workflows
description: >-
  Operational runbooks and business logic rules for the SOSENLINEA Property Maintenance & Facility ERP.
  Use when implementing or modifying workflows for work orders, quotes, key custody, accounting,
  PDF report generation, WhatsApp messaging, and contractor assignment.
---

# SOSENLINEA ERP Operational Workflows

This skill documents the business rules, data lifecycles, and operational requirements specific to SOSENLINEA.

## 1. Work Order Lifecycle (`reportes_ordenes`)

```text
[Recibido] ──> [Cotizado] ──> [Aprobado] ──> [En Ejecución] ──> [Finalizado] ──> [Facturado]
     │              │              │
     └──> [Rechazado/Cancelado] ───┘
```

- **Radicado Alfanumérico**: Unique serial format `SOS-1001`, `SOS-1002`, etc.
- **Traceability**: Every status transition must record an immutable audit history item with `timestamp`, `author`, `authorRole`, and `notes`.
- **Linked Quotes**: When a report reaches `Cotizado`, it must link directly to the `cotizaciones` module, carrying forward customer details, address, and initial diagnostic scope.

## 2. Quotes & Billing Engine (`cotizaciones`)

- Line Items: Itemized breakdowns containing description, quantity, unit price, and subtotal.
- Cost Overrun & Extras: Support dynamic addition of unforeseen labor or materials without losing original diagnostic estimates.
- Export Formats:
  - **PDF Generation**: Standard branded printable voucher with QR code verification and legal digital seal.
  - **Direct WhatsApp**: Encoded URL format (`https://wa.me/57.../?text=...`) prefilled with customer greeting, work order number, and PDF link.
  - **Physical Print**: CSS print stylesheet (`@media print`) hiding sidebars, toolbars, and extraneous UI.

## 3. Key Custody Management (`llaves`)

- Mandatory fields: Property address, real estate agency (`inmobiliaria`), key code/ring number, current possessor (technician/contractor), check-out date/time, expected return date.
- Real-time alerts for overdue keys (>24h without check-in).

## 4. Accounting & NIT Validation (`contabilidad`)

- Verification of Colombian NIT and Check Digit (DV) algorithm: modulo 11 algorithm with canonical weights `[3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]`.
- Income (`Ingreso`) and Expense (`Egreso`) reconciliation linked to work orders.
