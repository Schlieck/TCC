import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildReportHtml, type ReportDocument } from './report-html';

export class SharingUnavailableError extends Error {
  constructor() {
    super('Este aparelho não permite compartilhar arquivos.');
    this.name = 'SharingUnavailableError';
  }
}

/** Gera o PDF do relatório e abre a folha de compartilhamento do sistema. */
export async function shareReportPdf(document: ReportDocument): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new SharingUnavailableError();
  }
  const { uri } = await Print.printToFileAsync({ html: buildReportHtml(document) });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Compartilhar relatório',
  });
}
