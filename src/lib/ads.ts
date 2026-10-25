// Hook for monetisation. Called right before a user saves, prints or exports.
// Later: show an AdMob interstitial / rewarded ad here and resolve when it closes.
export type ExportKind = "image" | "pdf" | "print";

export async function beforeExport(kind: ExportKind): Promise<void> {
  void kind;
}
