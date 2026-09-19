"use client";

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
  DirectionProvider,
} from "@/registry/ui/radix/context-menu";

export default function ContextMenuRtlDemo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="w-full max-w-md p-6" dir="rtl">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-56 w-full items-center justify-center rounded-xl border border-border border-dashed bg-muted/20 text-center font-medium text-muted-foreground text-sm transition-colors hover:border-foreground/30 hover:bg-muted/40">
            <div className="flex select-none flex-col items-center gap-1.5 p-4">
              <span className="font-semibold text-foreground">
                انقر بزر الفأرة الأيمن هنا
              </span>
              <span className="text-muted-foreground text-xs">
                افتح القائمة السياقية من اليمين إلى اليسار
              </span>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-60">
            <ContextMenuItem>نسخ</ContextMenuItem>
            <ContextMenuItem>لصق</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>المزيد من الخيارات</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
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
