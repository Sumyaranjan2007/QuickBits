import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeEvent } from '@quickbite/types';

/**
 * Socket.IO gateway for real-time events.
 * Clients authenticate via JWT on connection, then join rooms to receive events.
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        this.logger.warn(`Socket connection rejected: no token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string, {
        secret: this.configService.get('jwt.secret'),
      });

      // Attach user data to socket
      (client as any).userId = payload.sub;
      (client as any).userRole = payload.role;

      // Auto-join user's personal room
      client.join(`user:${payload.sub}`);

      this.logger.log(`Socket connected: ${payload.sub} (${payload.role})`);
    } catch {
      this.logger.warn(`Socket connection rejected: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${(client as any).userId || 'unknown'}`);
  }

  // ─── Room Subscriptions ────────────────────────────────

  @SubscribeMessage('join:order')
  handleJoinOrder(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
    client.join(`order:${orderId}`);
    this.logger.debug(`${(client as any).userId} joined order:${orderId}`);
  }

  @SubscribeMessage('join:restaurant')
  handleJoinRestaurant(@ConnectedSocket() client: Socket, @MessageBody() restaurantId: string) {
    client.join(`restaurant:${restaurantId}`);
    this.logger.debug(`${(client as any).userId} joined restaurant:${restaurantId}`);
  }

  @SubscribeMessage('join:delivery')
  handleJoinDelivery(@ConnectedSocket() client: Socket, @MessageBody() partnerId: string) {
    client.join(`delivery:${partnerId}`);
  }

  @SubscribeMessage('leave:order')
  handleLeaveOrder(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
    client.leave(`order:${orderId}`);
  }

  // ─── Server-side Emission Methods ──────────────────────

  /**
   * Emit an order event to all subscribers of that order and restaurant.
   */
  emitOrderEvent(orderId: string, restaurantId: string, event: RealtimeEvent, data: Record<string, unknown>) {
    this.server?.to(`order:${orderId}`).emit(event, data);
    this.server?.to(`restaurant:${restaurantId}`).emit(event, data);
    this.logger.debug(`Emitted ${event} to order:${orderId} and restaurant:${restaurantId}`);
  }

  /**
   * Emit to a specific user.
   */
  emitToUser(userId: string, event: RealtimeEvent, data: Record<string, unknown>) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit delivery location update.
   */
  emitDeliveryLocation(orderId: string, location: { lat: number; lng: number }) {
    this.server?.to(`order:${orderId}`).emit(RealtimeEvent.DELIVERY_LOCATION_UPDATED, {
      orderId,
      location,
    });
  }
}
