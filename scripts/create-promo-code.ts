import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [rawCode, rawHours, rawMaxUses] = process.argv.slice(2);
  const code = rawCode?.trim().toUpperCase();
  const durationHours = Number(rawHours);
  const maxUses = Number(rawMaxUses);

  if (
    !code ||
    !Number.isInteger(durationHours) ||
    durationHours <= 0 ||
    !Number.isInteger(maxUses) ||
    maxUses <= 0
  ) {
    console.error("Usage: npm run promo:create CODE HOURS MAXUSES");
    process.exit(1);
  }

  const promoCode = await prisma.promoCode.upsert({
    where: { code },
    create: {
      code,
      durationHours,
      maxUses
    },
    update: {
      durationHours,
      maxUses
    }
  });

  console.log(
    `Promo code ${promoCode.code} is ready: ${promoCode.durationHours}h, ${promoCode.maxUses} max uses.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
