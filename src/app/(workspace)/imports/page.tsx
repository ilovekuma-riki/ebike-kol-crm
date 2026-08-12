import { PageHeader } from "@/components/page-header"; import { ImportWorkbench } from "@/components/import-workbench";
export default function Imports(){return <div><PageHeader eyebrow="DATA IMPORT" title="历史数据导入" description="先预览、再映射、最后写入。模糊名称只提醒，不会擅自合并 Partner。"/><div className="p-5 md:p-8"><ImportWorkbench/></div></div>}
