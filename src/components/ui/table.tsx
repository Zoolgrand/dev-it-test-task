import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">): React.JSX.Element {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-body-md", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">): React.JSX.Element {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-outline-variant/40 [&_tr]:bg-surface-container-low/70",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">): React.JSX.Element {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">): React.JSX.Element {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-outline-variant/40 bg-surface-container-low/70 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">): React.JSX.Element {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group border-b border-outline-variant/30 transition-colors hover:bg-surface-container-low/50",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">): React.JSX.Element {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-space-md py-3 text-left align-middle text-label-sm tracking-wider whitespace-nowrap text-on-surface-variant uppercase",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">): React.JSX.Element {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-space-md py-3.5 align-middle text-on-surface", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">): React.JSX.Element {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-body-sm text-on-surface-variant", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
