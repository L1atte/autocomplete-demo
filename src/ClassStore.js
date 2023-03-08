import BasicBlockStartState from "antlr4/src/antlr4/state/BasicBlockStartState";
import BasicState from "antlr4/src/antlr4/state/BasicState";
import BlockEndState from "antlr4/src/antlr4/state/BlockEndState";
import LoopEndState from "antlr4/src/antlr4/state/LoopEndState";
import PlusBlockStartState from "antlr4/src/antlr4/state/PlusBlockStartState";
import PlusLoopbackState from "antlr4/src/antlr4/state/PlusLoopbackState";
import RuleStartState from "antlr4/src/antlr4/state/RuleStartState";
import RuleStopState from "antlr4/src/antlr4/state/RuleStopState";
import StarBlockStartState from "antlr4/src/antlr4/state/StarBlockStartState";
import StarLoopEntryState from "antlr4/src/antlr4/state/StarLoopEntryState";
import StarLoopbackState from "antlr4/src/antlr4/state/StarLoopbackState";

import CommonToken from "antlr4/src/antlr4/CommonToken";

export class ParserStack {
	constructor(states) {
		this.states = states ? states : [];
	}

	removeLastState = () => {
		const cloneState = [...this.states];
		cloneState.pop();
		return cloneState;
	};

	addState = state => {
		return [...this.states, state];
	};

	process = state => {
		if (
			state instanceof RuleStartState || //
			state instanceof StarBlockStartState || //
			state instanceof BasicBlockStartState || //
			state instanceof PlusBlockStartState || //
			state instanceof StarLoopEntryState
		) {
			return {
				status: true,
				states: new ParserStack(this.addState(state)),
			};
		}
		let size = this.states.length;
		let last = this.states[size - 1];

		if (state instanceof BlockEndState) {
			if (last === state.startState)
				return {
					status: true,
					states: new ParserStack(this.removeLastState()),
				};
			return {
				status: false,
				states: this,
			};
		} else if (state instanceof LoopEndState) {
			const _state = state;
			const cont = last instanceof StarLoopEntryState && last.loopBackState === _state.loopBackState;
			if (!cont)
				return {
					status: false,
					states: this,
				};
			return {
				status: true,
				states: new ParserStack(this.removeLastState()),
			};
		} else if (state instanceof RuleStopState) {
			const cont = last instanceof RuleStartState && last.stopState === state;
			if (cont)
				return {
					status: true,
					states: new ParserStack(this.removeLastState()),
				};
			return {
				status: false,
				states: this,
			};
		} else if (
			state instanceof BasicState || //
			state instanceof BlockEndState || //
			state instanceof StarLoopbackState || //
			state instanceof PlusLoopbackState
		)
			return {
				status: true,
				states: this,
			};
	};
}
export class TokenStream {
	constructor(tokens, cursors) {
		this.tokens = tokens;
		this.cursors = cursors ? cursors : 0;
		this.UNKNOWN = new CommonToken(undefined, -1);
	}

	next() {
		if (this.cursors >= this.tokens.length) {
			return this.UNKNOWN;
		}
		return this.tokens[this.cursors];
	}

	atCaret() {
		return this.next().type < 0;
	}
	move() {
		return new TokenStream(this.tokens, this.cursors + 1);
	}
}

export class Collector {
	constructor() {
		this.collected = new Set();
	}

	collect(type) {
		this.collected.add(type);
	}

	getCollected() {
		return this.collected;
	}
}
