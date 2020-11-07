import UserClass from '../models/user';
import { User } from '../models/user.model';
import { ComponentRef } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import GoalClass from '../models/goal';
import { DocumentReference } from '@angular/fire/firestore';

export class TestUtils {
  // static getTestGroup(name: string, users?: Array<User>): Group {
  //   if (!users) {
  //     users = [
  //       new UserClass('1', 'Katie', 'kkunesh@gmail.com', false, [], [], []),
  //       new UserClass('2', 'Jacob', 'jdulai@gmail.com', false, [], [], []),
  //       new UserClass('3', 'Noah', 'nrizika@gmail.com', false, [], [], [])
  //     ];
  //   }
  //   return new GroupClass('1', name, users);
  // }

  static getRandomUID(): string {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  static getTestUser(
    uid = '5',
    name = 'Test User',
    email = 'testemail@email.com',
    isAdmin = false,
    classes: Array<DocumentReference>,
    goalsAssigned: Array<DocumentReference>,
    goalsCompleted: Array<DocumentReference>,
  ): User {
    return new UserClass(uid, name, email, isAdmin, classes, goalsAssigned, goalsCompleted);
  }

  static getElement(fixture: ComponentFixture<ComponentRef<any>>): HTMLElement {
    const element: HTMLElement = fixture.nativeElement as HTMLElement;
    return element;
  }

  // static getTestGoal(
  //   description = 'Test Goal',
  //   dueDate = new Date('2019-07-03'),
  //   isCompleted = false,
  //   id: 'abc123',
  //   createdBy = this.getTestUser(),
  //   assignedTo = [
  //     new UserClass('1', 'Katie', 'kkunesh@gmail.com', false, []),
  //     new UserClass('2', 'Jacob', 'jdulai@gmail.com', false, []),
  //     new UserClass('3', 'Noah', 'nrizika@gmail.com', false, [])
  //   ],
  //   notes = 'do something',
  //   groups = [
  //     this.getTestGroup('group 1'),
  //     this.getTestGroup('group 2')
  //   ]
  // ) {
  //   return new GoalClass(description, dueDate, id, isCompleted, createdBy, assignedTo, notes, groups);
  // }
}
