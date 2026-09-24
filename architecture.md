# aiNavLog — Software Architecture Document

| Document field | Value |
| --- | --- |
| Status | Draft — requirements captured; implementation architecture pending |
| Updated | 2026-09-24 |
| Owner | TBD |
| Structure | arc42 |
| Format | GitHub Markdown with Mermaid diagrams |

This document records the requirements established so far. **Confirmed** means stated by the product owner. **Proposed** identifies a design interpretation for review. **TBD** means no decision has been made. Diagrams describe logical responsibilities, not implemented services or deployment locations.

Adapted from the [arc42 template](https://arc42.org/overview/). Official templates and guidance: [downloads](https://arc42.org/download/) and [documentation](https://docs.arc42.org/).

## Contents

1. [Introduction and Goals](#1-introduction-and-goals)
2. [Constraints](#2-constraints)
3. [Context and Scope](#3-context-and-scope)
4. [Solution Strategy](#4-solution-strategy)
5. [Building Block View](#5-building-block-view)
6. [Runtime View](#6-runtime-view)
7. [Deployment View](#7-deployment-view)
8. [Crosscutting Concepts](#8-crosscutting-concepts)
9. [Architectural Decisions](#9-architectural-decisions)
10. [Quality Requirements](#10-quality-requirements)
11. [Risks and Technical Debt](#11-risks-and-technical-debt)
12. [Glossary](#12-glossary)

## 1. Introduction and Goals

### 1.1 Purpose

aiNavLog is an advanced analytics application that supports recreational boaters in making informed, real-time decisions. It provides recommendations using the user's own data and learning from the collective data and experiences of other mariners using aiNavLog.

### 1.2 Confirmed capabilities

| ID | Capability |
| --- | --- |
| R-01 | Provide recommendations to support real-time decision making. |
| R-02 | Accept photos and videos from local device storage, such as an iPhone. |
| R-03 | Support voice entries through a microphone. |
| R-04 | Support manual entries. |
| R-05 | Incorporate onboard instrument data; instruments and interfaces are TBD. |
| R-06 | Allow optional bulk uploads to cloud storage. |
| R-07 | Use cloud services to pull data from users' devices into cloud storage. |
| R-08 | Use collective data contributed by aiNavLog mariners for machine-learning training datasets. |
| R-09 | Retain uploaded data for a future training run; uploads do not automatically trigger retraining. |

### 1.3 Stakeholders

| Stakeholder | Interest | Status |
| --- | --- | --- |
| Recreational boater | Useful recommendations and convenient data entry | Confirmed primary user |
| Product owner | Product scope and recommendation behavior | Role; owner TBD |
| Development and model operations team | Implementation, training, deployment, and maintenance | Proposed role; ownership TBD |

### 1.4 Quality goals

Timely recommendations are a confirmed goal. Recommendation quality, usability aboard a boat, handling interrupted connectivity, and responsible data handling are proposed quality goals. Measurable acceptance criteria are recorded as TBD in Section 10.

## 2. Constraints

| Constraint | Status |
| --- | --- |
| Users choose whether and when to upload data to the cloud. | Confirmed |
| Cloud uploads and model-training runs are independent events. | Confirmed |
| Cloud services pull device data into cloud storage. | Confirmed intent; transfer mechanism TBD |
| Cloud storage provider is not selected. | Confirmed |
| Instrument integrations are not selected. | Confirmed |
| Supported operating systems, frameworks, budget, and delivery dates | TBD |

The iPhone is an example data source, not a confirmed exclusive platform. Optional cloud upload does not establish whether analytics can operate fully offline.

## 3. Context and Scope

### 3.1 Business context

Recreational boaters interact with aiNavLog to provide data and receive decision-support recommendations. Users may optionally contribute device data to cloud storage. Data contributed by mariners is accumulated for later model training, allowing recommendations to benefit from collective experience.

### 3.2 System context diagram

The system boundary includes the application and its logical cloud-transfer, storage, and training responsibilities. Hosting providers are implementation dependencies to be selected later. The current boater and other contributing mariners are the same user category, shown separately to explain collective learning.

```mermaid
flowchart LR
    Boater["Recreational boater"]
    Others["Other recreational boaters using aiNavLog"]
    Device["User device storage"]
    Instruments["Onboard instruments - TBD"]
    System["aiNavLog system: analytics, recommendations, optional cloud data collection, and model training"]

    Boater -->|"Voice and manual entries"| System
    Boater -->|"Chooses whether and when to upload"| System
    Device -->|"Photos, videos, and selected data"| System
    Instruments -.->|"Instrument data - interface TBD"| System