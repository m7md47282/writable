import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { DocumentData, Query, QueryDocumentSnapshot, UpdateData, WhereFilterOp } from 'firebase-admin/firestore';

export abstract class BaseFirebaseRepository<T extends DocumentData> {
  protected db = getFirebaseAdminFirestore();
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async create(data: T, id?: string): Promise<T & { id: string }> {
    let docRef;
    if (id) {
      docRef = this.db.collection(this.collectionName).doc(id);
    } else {
      docRef = this.db.collection(this.collectionName).doc();
    }
    
    await docRef.set(data);
    return { ...data, id: docRef.id };
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    await docRef.update(updates);
    
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as T;
  }

  async delete(id: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).delete();
  }

  async getAll(): Promise<T[]> {
    const snapshot = await this.db.collection(this.collectionName).get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as T);
  }

  async getWhere(field: string, operator: WhereFilterOp, value: unknown): Promise<T[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where(field, operator, value)
      .get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as T);
  }

  async getWhereMultiple(conditions: Array<{ field: string; operator: WhereFilterOp; value: unknown }>): Promise<T[]> {
    let query: Query<DocumentData, DocumentData> = this.db.collection(this.collectionName);
    
    conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as T);
  }

  async exists(id: string): Promise<boolean> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    return doc.exists;
  }

  async count(): Promise<number> {
    const snapshot = await this.db.collection(this.collectionName).get();
    return snapshot.size;
  }

  async batchCreate(items: Array<{ id: string; data: T }>): Promise<void> {
    const batch = this.db.batch();
    
    items.forEach(item => {
      const docRef = this.db.collection(this.collectionName).doc(item.id);
      batch.set(docRef, item.data);
    });
    
    await batch.commit();
  }

  async batchUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<void> {
    const batch = this.db.batch();
    
    updates.forEach(update => {
      const docRef = this.db.collection(this.collectionName).doc(update.id);
      batch.update(docRef, update.data as UpdateData<T>);
    });
    
    await batch.commit();
  }

  async batchDelete(ids: string[]): Promise<void> {
    const batch = this.db.batch();
    
    ids.forEach(id => {
      const docRef = this.db.collection(this.collectionName).doc(id);
      batch.delete(docRef);
    });
    
    await batch.commit();
  }
}
