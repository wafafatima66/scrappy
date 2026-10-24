import { Suspense } from "react";
import EditorApp from "@/components/EditorApp";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="center-msg">Opening your page…</div>}>
      <EditorApp />
    </Suspense>
  );
}
