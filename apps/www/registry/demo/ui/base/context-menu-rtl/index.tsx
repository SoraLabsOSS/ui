"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/ui/base/context-menu";

export default function ContextMenuRtlDemo() {
  return (
    <DirectionProvider direction="rtl">
      <div className="w-full max-w-md p-6" dir="rtl">
        <ContextMenu>
          <ContextMenuTrigger className="border-border bg-muted/20 text-muted-foreground hover:border-foreground/30 hover:bg-muted/40 flex h-56 w-full items-center justify-center rounded-xl border border-dashed text-center text-sm font-medium transition-colors">
            <div className="flex flex-col items-center gap-1.5 p-4 select-none">
              <span className="text-foreground font-semibold">
                انقر بزر الفأرة الأيمن هنا
              </span>
              <span className="text-muted-foreground text-xs">
                افتح القائمة السياقية من اليمين إلى اليسار
              </span>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-60" dir="rtl">
            <ContextMenuItem>نسخ</ContextMenuItem>
            <ContextMenuItem>لصق</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>المزيد من الخيارات</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48" dir="rtl">
                <ContextMenuItem>حفظ باسم</ContextMenuItem>
                <ContextMenuItem>أدوات المطور</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked>
              إظهار الملفات المخفية
            </ContextMenuCheckboxItem>
            <ContextMenuItem variant="destructive">حذف</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </DirectionProvider>
  );
}
