/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= STARTING OUR CONTRACT !!! ===========');
        const cars = [
            {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: 'Tomoko',
            },
            {
                color: 'red',
                make: 'Ford',
                model: 'Mustang',
                owner: 'Brad',
            },
            {
                color: 'green',
                make: 'Hyundai',
                model: 'Tucson',
                owner: 'Jin Soo',
            },
            {
                color: 'yellow',
                make: 'Volkswagen',
                model: 'Passat',
                owner: 'Max',
            },
            {
                color: 'black',
                make: 'Tesla',
                model: 'S',
                owner: 'Adriana',
            },
            {
                color: 'purple',
                make: 'Peugeot',
                model: '205',
                owner: 'Michel',
            },
            {
                color: 'white',
                make: 'Chery',
                model: 'S22L',
                owner: 'Aarav',
            },
            {
                color: 'violet',
                make: 'Fiat',
                model: 'Punto',
                owner: 'Pari',
            },
            {
                color: 'indigo',
                make: 'Tata',
                model: 'Nano',
                owner: 'Valeria',
            },
            {
                color: 'brown',
                make: 'Holden',
                model: 'Barina',
                owner: 'Shotaro',
            },
        ];

        for (let i = 0; i < cars.length; i++) {
            cars[i].docType = 'car';
            await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, carNumber, make, model, color, owner) {
        console.info('============= START : Create Car ===========');

        const car = {
            color,
            docType: 'car',
            make,
            model,
            owner,
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
        return { key: carNumber, car: car };
    }

    async queryAllCars(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }
    async createuser(ctx, id, firstname, lastname) {

        console.info('============= Create User ===========');

        if (!id || !firstname || !lastname) {
            throw new Error("enter the required fields");
        }
        const person = {
            firstname,
            lastname
        };
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(person)));
        console.info(person,id);

        console.info('============= End Create User ===========');

        return { userid: id, user: person };
    }


    async createLand(ctx, id, owner_id, information, forsale = 'false') {

        console.info('============= Create Land ===========');

        if (!id || !information) {
            throw new Error("enter the required fields");
        }
        const land = {
            information,
            forsale ,
            owner_id
        };
        console.info('land is: ', land);
        const checkOwner = await ctx.stub.getState(owner_id);
        
        if (!checkOwner || checkOwner === 0) {
            throw new Error(`car owner with ${owner_id} does not exist`);
        }
        const owner = JSON.parse(checkOwner.toString());
        console.info(owner);
        if ( forsale === 'true' || forsale === 'false' || !forsale ) {

            console.info('============= Middle Create Land ===========');

            await ctx.stub.putState(id, Buffer.from(JSON.stringify(land)));

            console.info('============= End Create Land ===========');
            return {landid : id , userid :owner_id};
        }
        else{
            throw new Error("the forsale attribute must equal true or false");
        }
    }

    async sellingLand(ctx, olduserId, newuserId, landid) {


        console.info('============= Selling Land ===========');

        const checkLand = await ctx.stub.getState(landid);
        if (!checkLand || checkLand.length === 0) {
            throw new Error(`${landid} does not exist`);
        }

        console.info('============= Land ===========');
        console.info(checkLand);

        const checkOldUser = await ctx.stub.getState(olduserId);
        if (!checkOldUser || checkOldUser.length === 0) {
            throw new Error(`${olduserId} does not exist`);
        }

        console.info('============= user 1  ===========');
        console.info(checkOldUser);

        const checkNewUser = await ctx.stub.getState(newuserId);
        if (!checkNewUser || checkNewUser.length === 0) {
            throw new Error(`${newuserId} does not exist`);
        }


        console.info('============= user 2 ===========');
        console.info(checkNewUser);

        console.info('============= required land ===========');
        const land = JSON.parse(checkLand.toString());
        console.info(land);

        if(land.forsale === false)
            throw new Error(`land ${landid} is not for sale`);

        land.owner = newuserId;
        console.info('land: ', land);
        return land;

    }
}

module.exports = FabCar;
