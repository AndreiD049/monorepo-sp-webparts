import { CacheController, CachedValueProxy, defaultKeyFactory, ICachedValue } from './cache-controller';
import { LocalClientStorage } from './local-client-storage';
import { MemoryClientStorage } from './memory-client-storage';

beforeEach(() => {
    localStorage.clear();
});

it('Cached proxy should get the value', async () => {
    const storage = new LocalClientStorage();
    const val: ICachedValue<string> = {
        expiration: Date.now() + 10000,
        value: 'testValue',
    };
    storage.set('test', JSON.stringify(val));
    const proxy = new CachedValueProxy(storage, 'test', { keyFactory: (url) => url });
    expect(await proxy.value()).toBe('testValue');
});

it('Cached proxy should return null if value does not exist', async () => {
    const storage = new LocalClientStorage();
    const proxy = new CachedValueProxy(storage, 'test');
    expect(await proxy.value()).toBeNull();
});

it('Cached proxy shoudl get null if value is expired', async () => {
    const storage = new LocalClientStorage();
    const val: ICachedValue<string> = {
        expiration: Date.now(),
        value: 'testValue',
    };
    storage.set('test', JSON.stringify(val));
    const proxy = new CachedValueProxy(storage, 'test');
    jest.spyOn(proxy, 'isExpired').mockReturnValueOnce(true);
    expect(await proxy.value()).toBeNull();
});

it('Should work with memory storage as well', async () => {
    const storage = new MemoryClientStorage();
    const val: ICachedValue<string> = {
        expiration: Date.now() + 10000,
        value: 'testValue',
    };
    const proxy = new CachedValueProxy(storage, 'test', { keyFactory: (url) => url });
    expect(await proxy.value<string>()).toBeNull();
    storage.set('test', JSON.stringify(val));
    expect(await proxy.value<string>()).toBe('testValue');
    jest.spyOn(proxy, 'isExpired').mockReturnValueOnce(true);
    expect(await proxy.value()).toBeNull();
});

it('Cached proxy value should removed the value from cache if it is expired', async () => {
    const storage = new MemoryClientStorage();
    const val: ICachedValue<string> = {
        expiration: Date.now() + 10000,
        value: 'testValue',
    };
    storage.set('test', JSON.stringify(val));
    const proxy = new CachedValueProxy(storage, 'test', { keyFactory: (url) => url });
    jest.spyOn(proxy, 'isExpired').mockReturnValueOnce(true);
    await proxy.value<string>();
    expect(await storage.get('test')).toBeNull();
});

it('Cached proxy should return null if Date.now is after expiratuin', async () => {
    const storage = new MemoryClientStorage();
    const val: ICachedValue<string> = {
        expiration: Date.now() + 10000,
        value: 'testValue',
    };
    storage.set('test', JSON.stringify(val));
    const proxy = new CachedValueProxy(storage, 'test');
    jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 10001);
    expect(await proxy.value()).toBe(null);
});

it('Should be possible to set a value using the proxy', async () => {
    const storage = new LocalClientStorage();
    const proxy = new CachedValueProxy(storage, 'answer');
    await proxy.set('42');
    expect(await proxy.value()).toBe('42');
});

it('Should be possible to set objects and arrays', async () => {
    const storage = new LocalClientStorage();
    const proxy = new CachedValueProxy(storage, 'answer', { keyFactory: (url) => url });
    await proxy.set({
        value: '42',
        source: 'computer',
    });
    expect(await proxy.value()).toEqual(
        expect.objectContaining({
            value: '42',
            source: 'computer',
        })
    );

    const newProxy = new CachedValueProxy(storage, 'question', { keyFactory: (url) => url });
    await newProxy.set([
        {
            value: 'why',
            source: 'computer',
        },
        {
            value: 'when',
            source: 'computer',
        },
    ]);
    expect(await newProxy.value()).toHaveLength(2);
    expect((await newProxy.value<any[]>())![0]).toEqual({
        value: 'why',
        source: 'computer',
    });
    // Check if expiration was set
    const item = JSON.parse(localStorage.getItem('question')!);
    expect(item.expiration).toBeLessThanOrEqual(Date.now() + 1000 * 5 * 60);
    expect(item.expiration).toBeGreaterThan(Date.now() + 1000 * 5 * 60 - 10);
});

it('Should be possible to delete a value from the store', async () => { 
    const storageLocal = new LocalClientStorage();
    const proxy = new CachedValueProxy(storageLocal, 'test');
    await proxy.set('test');
    await proxy.remove();
    expect(await storageLocal.get('test')).toBeNull();
});


it('Should work with Cache controller', async () => {
    const storage = new MemoryClientStorage();
    const controller = new CacheController(storage);
    const value = controller.get('test');
    expect(await value.value()).toBeNull();
    await value.set({ text: 'Hello' });
    expect(await controller.get('test').value()).toEqual({ text: 'Hello' });
    // There should be still only 1 entry in ProxyPull
    // @ts-ignore
    expect(controller.ProxyPull.size).toBe(1);
});

it('Should work with different values', async () => {
    const storage = new LocalClientStorage();
    const controller = new CacheController(storage);
    const value = controller.get('/url/1');
    const value2 = controller.get('/url/2');
    await value.set('1');
    await value2.set('2');
    // @ts-ignore
    expect(controller.ProxyPull.size).toBe(2);
    expect(await controller.get('/url/1').value()).toBe('1');
    expect(await controller.get('/url/2').value()).toBe('2');
});