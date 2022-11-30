import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, BadRequest } from '@curveball/http-errors';

import log from '../../log/service';
import { EventType } from '../../log/types';
import * as principalService from '../../principal/service';
import * as oauth2Service from '../service';

import * as privilegeService from '../../privilege/service';

class UserAccessTokenController extends Controller {

  async post(ctx: Context<any>) {

    const user = await principalService.findByExternalId(ctx.params.id);
    if (ctx.auth.equals(user) && !await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('You can only generate OAuth2 access tokens for yourself with this endpoint (unless you have the \'admin\' privilege (which you haven\'t))');
    }

    if (user.type !== 'user') {
      throw new BadRequest('This API can only be used for principals of type \'user\'');
    }
    const token = await oauth2Service.generateTokenForUserNoClient(user);

    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    };
    log(EventType.generateAccessToken, ctx.ip()!, user.id, ctx.request.headers.get('User-Agent'));

  }

}

export default new UserAccessTokenController();
