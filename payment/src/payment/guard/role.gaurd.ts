// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Role } from '../../enum/role-enum';
// import { ROLES_KEY } from '../decorator/role-decorator';
// import { ERROR_MESSAGES } from '../../utils/error-messages-constants';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     if (!user || !user.role) {
//       throw new ForbiddenException(ERROR_MESSAGES.ROLE_NOT_FOUND);
//     }
//     return requiredRoles.includes(user.role);
//   }
// }
