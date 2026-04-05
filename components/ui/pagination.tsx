"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Pagination = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex w-full justify-center", className)}
        {...props}
    />
));
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("flex flex-row items-center gap-1", className)}
        {...props}
    />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

interface PaginationLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isActive?: boolean;
    asChild?: boolean;
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
    ({ className, isActive, asChild = false, ...props }, ref) => (
        <Button
            ref={ref}
            variant={isActive ? "default" : "outline"}
            size="icon"
            className={cn(
                "h-8 w-8 px-0",
                isActive
                    ? "bg-[#06b6d4] text-white hover:bg-[#0891b2]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                className,
            )}
            {...props}
        />
    ),
);
PaginationLink.displayName = "PaginationLink";

const PaginationEllipsis = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn("flex h-8 w-8 items-center justify-center", className)}
        {...props}
    >
        ...
    </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis };
