import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildReportHtml, type ReportDocument } from './report-html';

const A4_IN_POINTS = { width: 595, height: 842 };

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
  // O expo-print grava fora do diretório que o expo-sharing pode ler no Expo Go;
  // por isso o PDF é regravado no cache do app.
  const { base64 } = await Print.printToFileAsync({
    html: buildReportHtml(document),
    ...A4_IN_POINTS,
    base64: true,
  });
  if (!base64) {
    throw new Error('O PDF gerado veio vazio.');
  }
  const file = new File(Paths.cache, `relatorio-shifty-${document.generatedOn}.pdf`);
  file.create({ overwrite: true });
  file.write(base64, { encoding: 'base64' });
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Compartilhar relatório',
  });
}
