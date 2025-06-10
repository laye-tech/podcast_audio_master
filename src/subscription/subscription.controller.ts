import { Crud, CrudController } from '@dataui/crud';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { SubscriptionUser } from './entities/subscription.entities';
import { SubscriptionService } from './subscription.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionDto } from './dtoSubscription/subscription.dto';

@ApiTags('Subscription-User')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: SubscriptionUser,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'uuid',
    },
  },
})
@Controller('subscription')
export class SubscriptionController
  implements CrudController<SubscriptionUser>
{
  constructor(public readonly service: SubscriptionService) {}

  @Post('/createSubscription')
  @ApiOperation({
    summary: "S'abonner a un podcast",
  })
  @ApiBody({ type: SubscriptionDto, required: false }) // Si dto est partiel
  @ApiResponse({
    status: 200,
    description: 'Creation effectue avec succes',
    type: SubscriptionUser,
  })
  @ApiResponse({
    status: 404,
    description: "Erreur dans la creation de l'abonnement",
  })
  async creatUserPlayList(
    @Body() dto: SubscriptionDto,
    @Req() req,
  ): Promise<SubscriptionUser> {
    return this.service.createSubscriptionUser(dto, req.user);
  }
}
