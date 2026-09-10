"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/ui/base/dropdown-menu";

export default function DropdownMenuRtlDemo() {
  return (
    <DirectionProvider direction="rtl">
      <div
        className="flex w-full max-w-md items-center justify-center p-6"
        dir="rtl"
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            فتح القائمة
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" dir="rtl">
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                المزيد من الخيارات
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48" dir="rtl">
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
