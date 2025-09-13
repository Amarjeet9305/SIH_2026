"use client"

import * as React from "react"
import * as AlertPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"

const Alert = AlertPrimitive.Root

const AlertTrigger = AlertPrimitive.Trigger

const AlertPortal = AlertPrimitive.Portal

const AlertOverlay = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertOverlay.displayName = AlertPrimitive.Overlay.displayName

const AlertContent = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertPortal>
    <AlertOverlay />
    <AlertPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertPortal>
))
AlertContent.displayName = AlertPrimitive.Content.displayName

const AlertHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertHeader.displayName = "AlertHeader"

const AlertFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertFooter.displayName = "AlertFooter"

const AlertTitle = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertTitle.displayName = AlertPrimitive.Title.displayName

const AlertDescription = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDescription.displayName = AlertPrimitive.Description.displayName

const AlertAction = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Action
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
AlertAction.displayName = AlertPrimitive.Action.displayName

const AlertCancel = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertPrimitive.Cancel
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
AlertCancel.displayName = AlertPrimitive.Cancel.displayName

export {
  Alert,
  AlertPortal,
  AlertOverlay,
  AlertTrigger,
  AlertContent,
  AlertHeader,
  AlertFooter,
  AlertTitle,
  AlertDescription,
  AlertAction,
  AlertCancel,
}
