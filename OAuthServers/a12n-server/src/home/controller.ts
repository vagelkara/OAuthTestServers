import Controller, { accept, method } from '@curveball/controller';
import { Context } from '@curveball/core';
import hal from './formats/hal';
import markdown from './formats/markdown';
import * as privilegeService from '../privilege/service';
import { getServerStats } from './service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../package.json').version;

class HomeController extends Controller {

  @method('GET')
  @accept('markdown')
  async getMd(ctx: Context) {

    const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin', '*');
    const stats = await getServerStats();

    const user = ctx.auth.principal!;

    ctx.response.type = 'text/markdown';
    ctx.response.headers.set('Title', 'Home');
    ctx.response.headers.append('Link', [
      '</>; rel="alternate"; type="application/hal+json"',
      '</logout>; rel="logout"',
      `</${user.href}>; rel="authenticated-as" title="${user.nickname.replace('"','')}"`,
    ]);
    ctx.response.body = markdown(version, user, isAdmin, stats);

  }

  @method('GET')
  @accept('application/hal+json')
  async getJson(ctx: Context) {

    const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin', '*');
    const stats = await getServerStats();
    ctx.response.headers.append('Link', [
      '</>; rel="alternate"; type="text/markdown"',
    ]);
    ctx.response.body = hal(version, ctx.auth.principal!, isAdmin, stats);

  }

}

export default new HomeController();
