import { Luminosidade, PrismaClient } from "@prisma/client";
import { logger } from "../src/infra/Logger";
// ARQUIVO TESTE PARA POPULAR O BANCO
// ESSE ARQUIVO, FOI COMPLETAMENTE FEITO POR IA

const prisma = new PrismaClient();

type PlantaSeed = {
    nome: string;
    especie: string;
    preco: number;
    estoque: number;
    luminosidade: Luminosidade;
    petFriendly: boolean;
    regaACadaDias: number;
};

const plantas: PlantaSeed[] = [
    {
        nome: "Costela-de-adão",
        especie: "Monstera deliciosa",
        preco: 8990,
        estoque: 12,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: true,
        regaACadaDias: 3,
    },
    {
        nome: "Zamioculca",
        especie: "Zamioculcas zamiifolia",
        preco: 9000,
        estoque: 15,
        luminosidade: Luminosidade.SOMBRA,
        petFriendly: false,
        regaACadaDias: 14,
    },
    {
        nome: "Espada-de-são-jorge",
        especie: "Dracaena trifasciata",
        preco: 7500,
        estoque: 20,
        luminosidade: Luminosidade.SOMBRA,
        petFriendly: false,
        regaACadaDias: 21,
    },
    {
        nome: "Jiboia",
        especie: "Epipremnum aureum",
        preco: 6000,
        estoque: 18,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: false,
        regaACadaDias: 7,
    },
    {
        nome: "Samambaia",
        especie: "Nephrolepis exaltata",
        preco: 5500,
        estoque: 10,
        luminosidade: Luminosidade.SOMBRA,
        petFriendly: true,
        regaACadaDias: 2,
    },
    {
        nome: "Echeveria",
        especie: "Echeveria elegans",
        preco: 2500,
        estoque: 30,
        luminosidade: Luminosidade.SOL_PLENO,
        petFriendly: true,
        regaACadaDias: 15,
    },
    {
        nome: "Mandacaru",
        especie: "Cereus jamacaru",
        preco: 3500,
        estoque: 8,
        luminosidade: Luminosidade.SOL_PLENO,
        petFriendly: true,
        regaACadaDias: 30,
    },
    {
        nome: "Antúrio",
        especie: "Anthurium andraeanum",
        preco: 8000,
        estoque: 9,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: false,
        regaACadaDias: 4,
    },
    {
        nome: "Peperômia",
        especie: "Peperomia obtusifolia",
        preco: 4500,
        estoque: 14,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: true,
        regaACadaDias: 7,
    },
    {
        nome: "Palmeira-areca",
        especie: "Dypsis lutescens",
        preco: 15000,
        estoque: 6,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: true,
        regaACadaDias: 3,
    },
    {
        nome: "Flor-de-cera",
        especie: "Hoya carnosa",
        preco: 11000,
        estoque: 0,
        luminosidade: Luminosidade.SOL_PLENO,
        petFriendly: true,
        regaACadaDias: 10,
    },
    {
        nome: "Manjericão",
        especie: "Ocimum basilicum",
        preco: 1500,
        estoque: 25,
        luminosidade: Luminosidade.SOL_PLENO,
        petFriendly: true,
        regaACadaDias: 2,
    },
];

const main = async () => {
    for (const planta of plantas) {
        const existente = await prisma.planta.findFirst({
            where: {
                nome: {
                    equals: planta.nome,
                    mode: "insensitive",
                },
            },
        });
        if (existente) {
            logger.info("Planta já cadastrada", { nome: planta.nome });
            continue;
        }
        await prisma.planta.create({ data: planta });
        logger.info("Planta cadastrada", { nome: planta.nome });
    }
};

main()
    .catch((error) => {
        logger.error("Error seeding database", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
