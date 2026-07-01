import JSZip from "jszip";

// pptxgenjs@4.0.1 버그: makeXmlContTypes()가 실제 마스터 파일 수와 무관하게 슬라이드 개수만큼
// "/ppt/slideMasters/slideMasterN.xml" Content_Types 항목을 선언한다. 실제로는 slideMaster1.xml
// 하나만 zip에 존재하기 때문에, 존재하지 않는 파트를 참조하는 손상된 패키지가 만들어져
// PowerPoint/Keynote 등에서 슬라이드가 깨지거나 같은 화면이 반복되는 문제가 발생한다.
// 생성된 zip을 열어 실제 존재하지 않는 slideMaster 항목을 Content_Types.xml에서 제거해 고친다.
export async function fixPptxContentTypes(buffer: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);

  const existingMasters = new Set<number>();
  zip.forEach((relPath) => {
    const match = relPath.match(/^ppt\/slideMasters\/slideMaster(\d+)\.xml$/);
    if (match) existingMasters.add(Number(match[1]));
  });

  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) return buffer;

  const xml = await contentTypesFile.async("string");
  const fixedXml = xml.replace(
    /<Override PartName="\/ppt\/slideMasters\/slideMaster(\d+)\.xml"[^>]*\/>/g,
    (tag, n) => (existingMasters.has(Number(n)) ? tag : "")
  );

  if (fixedXml === xml) return buffer;

  zip.file("[Content_Types].xml", fixedXml);
  const fixedBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return fixedBuffer;
}
