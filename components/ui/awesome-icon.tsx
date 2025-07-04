"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface AwesomeIconProps {
    icon: string // Font awesome icon class (e.g. "fa-user", "fa-home", etc.)
    className?: string
    solid?: boolean // Use solid icons (fas) by default
    regular?: boolean // Use regular icons (far)
    brands?: boolean // Use brand icons (fab)
    light?: boolean // Use light icons (fal)
    duotone?: boolean // Use duotone icons (fad)
    thin?: boolean // Use thin icons (fat)
    size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x'
    fixedWidth?: boolean
    spin?: boolean
    pulse?: boolean
    rotate?: '90' | '180' | '270' | 'flip-horizontal' | 'flip-vertical'
}

export function AwesomeIcon({
    icon,
    className,
    solid = true,
    regular = false,
    brands = false,
    light = false,
    duotone = false,
    thin = false,
    size,
    fixedWidth = false,
    spin = false,
    pulse = false,
    rotate,
    ...props
}: AwesomeIconProps) {
    // Determine the icon type prefix
    let prefix = solid ? 'fas' : ''
    prefix = regular ? 'far' : prefix
    prefix = brands ? 'fab' : prefix
    prefix = light ? 'fal' : prefix
    prefix = duotone ? 'fad' : prefix
    prefix = thin ? 'fat' : prefix

    // If icon name suggests a brand (like facebook, twitter, etc.), use the brands prefix
    const commonBrands = ['facebook', 'twitter', 'instagram', 'youtube', 'tiktok', 'spotify', 'apple', 'google', 'amazon']
    if (icon && !prefix && commonBrands.some(brand => icon.includes(brand))) {
        prefix = 'fab'
    }

    // Build the class list
    const classes = [
        prefix,
        icon,
        size ? `fa-${size}` : '',
        fixedWidth ? 'fa-fw' : '',
        spin ? 'fa-spin' : '',
        pulse ? 'fa-pulse' : '',
        rotate ? `fa-rotate-${rotate}` : '',
        className || '',
    ].filter(Boolean)

    return <i className={cn(classes.join(' '))} {...props} />
}
