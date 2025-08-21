import prisma from "./prisma";

const generateNumbers = {
    async generateWorkspaceNumber(): Promise<string> {
        const result = await prisma.$queryRaw<[{ nextval: bigint }]>
        `SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 3) AS INTEGER)), 0) + 1 as nextval 
        FROM workspaces 
        WHERE number ~ '^WS[0-9]+$' `;
        
        const nextNumber = Number(result[0].nextval);
        return `WS${nextNumber}`;
  }

}

export default generateNumbers;