import { Injectable, inject, signal } from '@angular/core';
import { ChatMessage, QuickPrompt } from '../models/advisor.model';
import { TrackerService } from '../../tracker/services/tracker.service';
import { InvestmentService } from '../../investment/services/investment.service';

@Injectable({ providedIn: 'root' })
export class AdvisorService {
    private trackerService = inject(TrackerService);
    private investmentService = inject(InvestmentService);

    messages = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);

    quickPrompts: QuickPrompt[] = [
        { label: 'Spending Analysis', icon: 'pi pi-chart-pie', prompt: 'Analyze my spending patterns and suggest where I can save money.' },
        { label: 'Investment Review', icon: 'pi pi-chart-line', prompt: 'Review my ad campaign investments and suggest which platforms give the best ROI.' },
        { label: 'Budget Advice', icon: 'pi pi-wallet', prompt: 'Based on my income and expenses, suggest an optimal monthly budget allocation.' },
        { label: 'Best Campaigns', icon: 'pi pi-megaphone', prompt: 'Which of my campaigns are performing best and which should I pause or optimize?' },
        { label: 'Savings Goal', icon: 'pi pi-flag', prompt: 'Help me set a realistic savings goal based on my current financial situation.' },
        { label: 'Risk Assessment', icon: 'pi pi-exclamation-triangle', prompt: 'Assess the risk level of my current investment portfolio across all platforms.' }
    ];

    async sendMessage(userMessage: string): Promise<void> {
        // Add user message
        const userMsg: ChatMessage = {
            id: 'msg_' + Date.now(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        this.messages.set([...this.messages(), userMsg]);
        this.isLoading.set(true);

        // Simulate AI response with context-aware analysis
        await this.simulateDelay(1500);

        const response = this.generateResponse(userMessage);
        const assistantMsg: ChatMessage = {
            id: 'msg_' + (Date.now() + 1),
            role: 'assistant',
            content: response,
            timestamp: new Date()
        };
        this.messages.set([...this.messages(), assistantMsg]);
        this.isLoading.set(false);
    }

    clearChat() {
        this.messages.set([]);
    }

    private generateResponse(query: string): string {
        const lowerQuery = query.toLowerCase();
        const transactions = this.trackerService.transactions();
        const campaigns = this.investmentService.campaigns();

        const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amount || 0), 0);
        const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount || 0), 0);
        const totalAdSpent = campaigns.reduce((s, c) => s + c.spent, 0);
        const totalAdRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

        if (lowerQuery.includes('spending') || lowerQuery.includes('expense') || lowerQuery.includes('save')) {
            const categories = new Map<string, number>();
            transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
                categories.set(t.category || 'Other', (categories.get(t.category || 'Other') || 0) + (t.amount || 0));
            });
            const topCategory = [...categories.entries()].sort((a, b) => b[1] - a[1])[0];

            return `📊 **Spending Analysis**\n\n` +
                `Your total expenses are **৳${totalExpense.toLocaleString()}** against income of **৳${totalIncome.toLocaleString()}**.\n\n` +
                `**Top spending category:** ${topCategory ? topCategory[0] + ' (৳' + topCategory[1].toLocaleString() + ')' : 'N/A'}\n\n` +
                `**Recommendations:**\n` +
                `• Your savings rate is ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%. Aim for at least 20-30%.\n` +
                `• Consider setting category-wise budget limits.\n` +
                `• Review recurring expenses — even small reductions compound over time.\n` +
                `• The 50/30/20 rule: 50% needs, 30% wants, 20% savings.`;
        }

        if (lowerQuery.includes('investment') || lowerQuery.includes('roi') || lowerQuery.includes('campaign') || lowerQuery.includes('platform')) {
            const bestCampaign = [...campaigns].sort((a, b) => b.roas - a.roas)[0];
            const worstCampaign = [...campaigns].sort((a, b) => a.roas - b.roas)[0];

            return `📈 **Investment & Campaign Review**\n\n` +
                `**Total Ad Spend:** ৳${totalAdSpent.toLocaleString()}\n` +
                `**Total Revenue:** ৳${totalAdRevenue.toLocaleString()}\n` +
                `**Overall ROAS:** ${totalAdSpent > 0 ? (totalAdRevenue / totalAdSpent).toFixed(2) : 0}x\n\n` +
                `**Best Performer:** ${bestCampaign ? bestCampaign.name + ' (' + bestCampaign.platformName + ') — ' + bestCampaign.roas + 'x ROAS' : 'N/A'}\n` +
                `**Needs Attention:** ${worstCampaign ? worstCampaign.name + ' (' + worstCampaign.platformName + ') — ' + worstCampaign.roas + 'x ROAS' : 'N/A'}\n\n` +
                `**Recommendations:**\n` +
                `• Shift more budget to high-ROAS campaigns (>5x).\n` +
                `• Pause or restructure campaigns with ROAS below 3x.\n` +
                `• Email marketing and organic/SEO show the best cost efficiency.\n` +
                `• Consider A/B testing ad creatives on underperforming platforms.`;
        }

        if (lowerQuery.includes('budget') || lowerQuery.includes('allocation')) {
            const netIncome = totalIncome;
            return `💰 **Budget Allocation Advice**\n\n` +
                `Based on your monthly income of **৳${netIncome.toLocaleString()}**, here's a suggested allocation:\n\n` +
                `| Category | % | Amount |\n` +
                `|----------|---|--------|\n` +
                `| Essentials (rent, food, utilities) | 50% | ৳${Math.round(netIncome * 0.5).toLocaleString()} |\n` +
                `| Investments & Savings | 25% | ৳${Math.round(netIncome * 0.25).toLocaleString()} |\n` +
                `| Business/Ad Spend | 15% | ৳${Math.round(netIncome * 0.15).toLocaleString()} |\n` +
                `| Personal & Lifestyle | 10% | ৳${Math.round(netIncome * 0.1).toLocaleString()} |\n\n` +
                `**Tips:**\n` +
                `• Automate savings transfers on salary day.\n` +
                `• Keep 3-6 months expenses as emergency fund.\n` +
                `• Reinvest ad profits into high-performing campaigns.`;
        }

        if (lowerQuery.includes('risk') || lowerQuery.includes('assess')) {
            const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
            const highSpendCampaigns = activeCampaigns.filter(c => c.spent > c.budget * 0.8);

            return `⚠️ **Risk Assessment**\n\n` +
                `**Active Campaigns:** ${activeCampaigns.length}\n` +
                `**Near Budget Limit:** ${highSpendCampaigns.length} campaigns have used >80% of budget\n\n` +
                `**Risk Factors:**\n` +
                `• ${highSpendCampaigns.length > 0 ? '🔴 ' + highSpendCampaigns.length + ' campaigns approaching budget cap — review or increase.' : '🟢 All campaigns within budget.'}\n` +
                `• ${totalAdSpent > totalIncome * 0.3 ? '🔴 Ad spend exceeds 30% of income — high risk.' : '🟢 Ad spend is within healthy range.'}\n` +
                `• Platform diversification: ${new Set(campaigns.map(c => c.platformId)).size} platforms — ${new Set(campaigns.map(c => c.platformId)).size >= 4 ? '🟢 Good diversification.' : '🟡 Consider diversifying.'}\n\n` +
                `**Recommendations:**\n` +
                `• Never put more than 40% of ad budget on a single platform.\n` +
                `• Maintain a reserve fund for scaling winning campaigns.\n` +
                `• Set stop-loss rules: pause campaigns if ROAS drops below 2x.`;
        }

        if (lowerQuery.includes('saving') || lowerQuery.includes('goal')) {
            const monthlySavings = totalIncome - totalExpense;
            return `🎯 **Savings Goal Planning**\n\n` +
                `**Current Monthly Savings:** ৳${monthlySavings.toLocaleString()}\n` +
                `**Savings Rate:** ${totalIncome > 0 ? Math.round((monthlySavings / totalIncome) * 100) : 0}%\n\n` +
                `**Suggested Goals:**\n` +
                `• Emergency Fund (6 months): ৳${(totalExpense * 6).toLocaleString()} — ${monthlySavings > 0 ? Math.ceil((totalExpense * 6) / monthlySavings) + ' months to achieve' : 'Need positive savings first'}\n` +
                `• Investment Fund: Allocate 20% of savings (৳${Math.round(monthlySavings * 0.2).toLocaleString()}/month) to mutual funds or FDR\n` +
                `• Business Growth: Reinvest top campaign profits\n\n` +
                `**Action Steps:**\n` +
                `• Set up auto-transfer to savings account on salary day.\n` +
                `• Track progress monthly in the Tracker module.\n` +
                `• Review and adjust goals quarterly.`;
        }

        // Default response
        return `🤖 **AI Financial Advisor**\n\n` +
            `I can help you with:\n\n` +
            `• **Spending Analysis** — Understand where your money goes\n` +
            `• **Investment Review** — Evaluate your ad campaign performance\n` +
            `• **Budget Planning** — Optimal allocation of your income\n` +
            `• **Risk Assessment** — Identify financial risks\n` +
            `• **Savings Goals** — Plan and track your savings\n\n` +
            `Your current snapshot:\n` +
            `• Income: ৳${totalIncome.toLocaleString()} | Expenses: ৳${totalExpense.toLocaleString()}\n` +
            `• Ad Investment: ৳${totalAdSpent.toLocaleString()} | Ad Revenue: ৳${totalAdRevenue.toLocaleString()}\n\n` +
            `Try asking me something specific, or use the quick prompts above!`;
    }

    private simulateDelay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
