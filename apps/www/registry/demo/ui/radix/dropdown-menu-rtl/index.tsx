"use client";

import {
  DirectionProvider,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/ui/radix/dropdown-menu";

export default function DropdownMenuRtlDemo() {
  return (
    <DirectionProvider dir="rtl">
      <div
        className="flex w-full max-w-md items-center justify-center p-6"
        dir="rtl"
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="border-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none">
            فتح القائمة
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                المزيد من الخيارات
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>أدوات المطور</DropdownMenuItem>
                <DropdownMenuItem>حفظ باسم</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              إظهار شريط الإشارات
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem variant="destructive">
              حذف الحساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DirectionProvider>
  );
}
