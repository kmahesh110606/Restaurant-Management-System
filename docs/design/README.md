# 🎨 Savore RMS — Software Design & Architecture Package

This directory contains all design artifacts for **Digital Assignment 2 / Review 2**, including editable Draw.io diagram sources, high-resolution PNG exports, and user interface screen designs.

---

## 📐 System & Architecture Diagrams

All diagrams are provided in both **editable Draw.io XML format** (`.drawio`) and **high-resolution PNG exports** (`.png`).

| Diagram | Description | Draw.io Source (Editable) | PNG Export |
| :--- | :--- | :--- | :--- |
| **Three-Tier Architecture** | Presentation (React SPA), Business Logic (Django DRF), Data (PostgreSQL 16) | [architecture.drawio](architecture.drawio) | [architecture.png](architecture.png) |
| **Authentication Flow** | Sequence diagram: JWT authentication, role verification & token refresh | [authentication.drawio](authentication.drawio) | [authentication.png](authentication.png) |
| **Entity-Relationship Data Model** | Crow's Foot ER diagram: Multi-tenant schemas, orders, tables, bills, and menu catalog | [datamodel.drawio](datamodel.drawio) | [datamodel.png](datamodel.png) |

---

## 🖥️ User Interface Design (6 Screens)

The UI adheres to modern, user-friendly design principles: clear visual hierarchy, accessible contrast, responsive layout, intuitive navigation, and status-driven color coding.

| Screen | Title | Key Features | Screenshot |
| :---: | :--- | :--- | :---: |
| **1** | **Manager Analytics Portal** | Sales curves, AOV trends, top recipe dispatch metrics, weekly shift rotations | [Picture1.png](Picture1.png) |
| **2** | **Staff / Waiter Operations** | Active orders Kanban (Pending, Preparing, Ready, Served), floor mapping | [Picture2.png](Picture2.png) |
| **3** | **Customer Table Reservation** | Date & time slot picker, interactive table floor map, booking confirmation modal | [Picture3.png](Picture3.png) |
| **4** | **Customer Digital Menu** | Category tabs, rich dish cards with pricing, descriptions, dynamic cart drawer | [Picture4.png](Picture4.png) |
| **5** | **Kitchen Display System (KDS)** | Chef order tickets, prep status stages, allergy/dietary alerts, one-tap progress | [Picture5.png](Picture5.png) |
| **6** | **Admin Operations Overview** | Revenue telemetry, floor occupancy rate, average prep time, live order stream | [Picture6.png](Picture6.png) |

---

## 🏛️ Design Decisions & Principles Summary

1. **Modularity & Layered Separation**: Separation of Presentation (React SPA), Business Logic (DRF ViewSets), and Persistence (PostgreSQL).
2. **High Cohesion & Low Coupling**: Domain-focused modules (`orders`, `tables`, `menu`, `bills`) communicating strictly via standardized REST contracts.
3. **Data Integrity & Security**: Server-side price recalculation, database-level transaction scoping per tenant (`Restaurant` FK), and stateless JWT role-based access control.
