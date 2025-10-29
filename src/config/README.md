# Configuration System

## Overview

This directory contains all application-wide configuration files for the project.

## Files

### `index.js`

Main configuration aggregator that exports all configs.

### `company.config.js`

Company branding and settings configuration:

- Logo settings
- Company colors
- Navbar/Sidebar specific settings

### `responsive.config.js`

Responsive breakpoints and device-specific configurations.

## Usage

```javascript
import { appConfig } from "@/config";

// Access company config
const logoMaxHeight = appConfig.company.defaults.logoSettings.maxHeight;

// Access responsive config
const mobileMaxWidth = appConfig.responsive.mobile.maxWidth;
```
