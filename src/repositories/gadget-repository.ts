import prisma from '../config/prisma-client';
import { Prisma, Gadget, GadgetStatus } from '@prisma/client';

class GadgetRepository {
    async create(name: string, codename: string): Promise<Gadget> {
        return await prisma.gadget.create({
            data: {
                name,
                codename,
            },
        });
    }

    async findAll(status?: GadgetStatus): Promise<Gadget[]> {
        return await prisma.gadget.findMany({
            where: status ? { status } : {},
        });
    }

    async update(id: string, updateData: Prisma.GadgetUpdateInput): Promise<Gadget | null> {
        return await prisma.gadget.update({
            where: { id },
            data: updateData,
        });
    }

    async decommission(id: string): Promise<Gadget | null> {
        return await prisma.gadget.update({
            where: { id },
            data: {
                status: GadgetStatus.Decommissioned,
                decommissionedAt: new Date(),
            },
        });
    }

    async selfDestruct(id: string): Promise<Gadget | null> {
        return await prisma.gadget.update({
            where: { id },
            data: {
                status: GadgetStatus.Destroyed,
            },
        });
    }
}

export default GadgetRepository;
