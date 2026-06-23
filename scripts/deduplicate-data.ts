import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(__dirname, '../emo-visual-data/data.json');
const BACKUP_PATH = path.join(__dirname, '../emo-visual-data/data.json.backup');

interface MemeData {
  filename: string;
  content: string;
}

function deduplicateData() {
  console.log('Loading data.json...');
  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  const data: MemeData[] = JSON.parse(rawData);

  console.log(`Total entries: ${data.length}`);

  // 按 filename 去重，保留第一个出现的
  const seen = new Set<string>();
  const deduplicated: MemeData[] = [];
  const duplicates: MemeData[] = [];

  for (const item of data) {
    if (!seen.has(item.filename)) {
      seen.add(item.filename);
      deduplicated.push(item);
    } else {
      duplicates.push(item);
    }
  }

  console.log(`\nDuplicates found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('\nDuplicate filenames:');
    duplicates.forEach(item => {
      console.log(`  - ${item.filename}`);
    });
  }

  // 备份原始文件
  console.log(`\nBacking up original file to: data.json.backup`);
  fs.copyFileSync(DATA_PATH, BACKUP_PATH);

  // 保存去重后的数据
  console.log(`Writing deduplicated data (${deduplicated.length} entries)...`);
  fs.writeFileSync(DATA_PATH, JSON.stringify(deduplicated, null, 2));

  console.log('\n✅ Deduplication completed!');
  console.log(`Original: ${data.length} entries`);
  console.log(`Deduplicated: ${deduplicated.length} entries`);
  console.log(`Removed: ${data.length - deduplicated.length} duplicates`);
}

deduplicateData();
