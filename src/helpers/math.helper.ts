import Bignumber, { BigNumber } from 'bignumber.js';
import { AppError } from '../infra/app-error';
import { Errors } from '../infra/messages';

type ResultOp = {
    _toString?: boolean,
    _toNumber?: boolean,
    _precision?: number,
}

type OperationResult = {
    operate: (operation: string, operand2: string | Bignumber | number) => OperationResult,
    result: (op?: ResultOp) => any,
}

export default class BigMath {
    static operate(operand1: number | string | BigNumber, operation: string, operand2: number | string | BigNumber,
        options: ResultOp = { _toString: false, _toNumber: false, _precision: undefined }
    ): OperationResult {

        const { _toString, _toNumber, _precision } = options;

        let a = new Bignumber(operand1);
        let b = new Bignumber(operand2);

        let operator;

        switch (operation.toLowerCase()) {
            case '-':
                operator = function (a, b) { return a.minus(b); };
                break;
            case '+':
                operator = function (a, b) { return a.plus(b); };
                break;
            case '*':
            case 'x':

                operator = function (a, b) { return a.times(b); };
                break;
            case '÷':
            case '/':

                operator = function (a, b) {
                    if (b == 0) return 0;

                    return a.div(b);
                };
                break;
            case '^':
                operator = function (a, b) { return a.pow(b); };
                break;

            // Let us pass in a function to perform other operations.
            default:
                operator = operation;
        }

        let result: BigNumber = operator(a, b);

        let finalResult: any = result;

        return {
            operate: (operation, operand2) => BigMath.operate(finalResult, operation, operand2),
            result: (options: ResultOp = {}) => {

                const { _toString = false, _toNumber = false, _precision = 0 } = options;

                if (_toString)
                    finalResult = result.toString(10);
                else if (_toNumber)
                    finalResult = result.toNumber();
                else if (_precision) {
                    finalResult = result.toFixed(_precision)
                }
                else
                    finalResult = result;

                return finalResult;
            }
        }
    }
}