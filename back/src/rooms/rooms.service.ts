import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './rooms.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(createRoomDto: CreateRoomDto) {
    if (createRoomDto.type === 'FUNCIONAL') {
      if (!createRoomDto.teacherId) {
        throw new BadRequestException(
          'Para una sala FUNCIONAL, debe asignarse un profesor.',
        );
      }
      const teacher = await this.prisma.users.findUnique({
        where: { id: createRoomDto.teacherId },
      });
      if (!teacher || teacher.role !== 'USER_TRAINING') {
        throw new BadRequestException(
          'El profesor asignado debe tener el rol USER_TRAINING.',
        );
      }
    }
    const data: any = {
      name: createRoomDto.name,
      capacity: createRoomDto.capacity,
      day: createRoomDto.day,
      time: createRoomDto.time,
      type: createRoomDto.type,
      isDeleted: false,
      teacher: createRoomDto.teacherId
        ? { connect: { id: createRoomDto.teacherId } }
        : undefined,
    };

    return this.prisma.room.create({ data });
  }

  async findAll() {
    return this.prisma.room.findMany({
      where: { isDeleted: false },
    });
  }

  async findOneById(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Sala no encontrada');
    return room;
  }

  async findOneByName(name: string) {
    const room = await this.prisma.room.findFirst({ where: { name } });
    if (!room) throw new NotFoundException('Sala no encontrada');
    return room;
  }

  async updateRoom(id: string, updateRoomDto: UpdateRoomDto) {
    const existingRoom = await this.findOneById(id);

    if (updateRoomDto.type === 'FUNCIONAL') {
      if (!updateRoomDto.teacherId) {
        throw new BadRequestException(
          'Para una sala FUNCIONAL, debe asignarse un profesor.',
        );
      }
      const teacher = await this.prisma.users.findUnique({
        where: { id: updateRoomDto.teacherId },
      });
      if (!teacher || teacher.role !== 'USER_TRAINING') {
        throw new BadRequestException(
          'El profesor asignado debe tener el rol USER_TRAINING.',
        );
      }
    }
    const data: any = {
      name: updateRoomDto.name,
      capacity: updateRoomDto.capacity,
      day: updateRoomDto.day,
      time: updateRoomDto.time,
      type: updateRoomDto.type,
      teacher: updateRoomDto.teacherId
        ? { connect: { id: updateRoomDto.teacherId } }
        : undefined,
    };

    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async softDeleteRoom(id: string) {
    await this.findOneById(id);
    await this.prisma.room.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { message: `Sala con ID: ${id} eliminada con éxito.` };
  }
}
